from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.supabase_client import supabase, supabase_admin
from app.dependencies import get_current_user
from app.config import settings
from app.services.capsule_service import CapsuleService
import uuid
from datetime import datetime, timedelta, timezone

router = APIRouter()


ALLOWED_TYPES = {
    "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "video": ["video/mp4", "video/webm", "video/quicktime"],
    "audio": ["audio/mpeg", "audio/wav", "audio/ogg"],
    "text": ["text/plain"]
}


@router.post("/upload/{capsule_id}", status_code=status.HTTP_201_CREATED)
async def upload_media(
    capsule_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload media (image, video, audio, or text) to a capsule.
    Files are stored in Supabase Storage with private access.
    Only accessible via signed URLs after capsule is unlocked.
    """

    # Verify capsule exists and user has access
    capsule = await CapsuleService.get_capsule_by_id(capsule_id, current_user["id"])

    # Check if capsule is already unlocked
    if capsule["is_unlocked"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add media to an unlocked capsule"
        )

    # Validate file type
    file_type_category = None
    for category, mime_types in ALLOWED_TYPES.items():
        if file.content_type in mime_types:
            file_type_category = category
            break

    if not file_type_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not supported"
        )

    # Check file size
    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE / 1024 / 1024}MB limit"
        )

    # Generate unique filename
    file_extension = file.filename.split(
        ".")[-1] if "." in file.filename else ""
    unique_filename = f"{current_user['id']}/{capsule_id}/{uuid.uuid4()}.{file_extension}"

    try:
        # Upload to Supabase Storage
        storage_response = supabase_admin.storage.from_(settings.STORAGE_BUCKET).upload(
            unique_filename,
            file_content,
            {
                "content-type": file.content_type,
                "cache-control": "3600"
            }
        )

        # Create media record in database
        media_data = {
            "capsule_id": capsule_id,
            "filename": file.filename,
            "file_path": unique_filename,
            "file_type": file_type_category,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }

        db_response = supabase_admin.table(
            "media").insert(media_data).execute()

        if not db_response.data:
            # Rollback: delete uploaded file
            supabase_admin.storage.from_(
                settings.STORAGE_BUCKET).remove([unique_filename])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save media record"
            )

        media_record = db_response.data[0]

        return {
            "id": media_record["id"],
            "filename": file.filename,
            "file_type": file_type_category,
            "capsule_id": capsule_id,
            "message": "Media uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/{media_id}/url")
async def get_media_url(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a signed URL for accessing media.
    Only works if the capsule is unlocked.
    Signed URL expires after 1 hour.
    """

    # Get media record
    media_response = supabase_admin.table("media")\
        .select("*, capsules(*)")\
        .eq("id", media_id)\
        .execute()

    if not media_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    media = media_response.data[0]
    capsule = media["capsules"]

    # Verify access to capsule
    await CapsuleService.get_capsule_by_id(capsule["id"], current_user["id"])

    # Check if capsule is unlocked
    unlock_date = datetime.fromisoformat(
        capsule["unlock_date"].replace("Z", "+00:00"))
    is_unlocked = datetime.now(timezone.utc) >= unlock_date

    if not is_unlocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Capsule is still locked. Media will be available after unlock date."
        )

    # Generate signed URL (valid for 1 hour)
    try:
        signed_url = supabase_admin.storage.from_(settings.STORAGE_BUCKET)\
            .create_signed_url(media["file_path"], 3600)

        return {
            "url": signed_url["signedURL"],
            "expires_in": 3600
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate URL: {str(e)}"
        )


@router.delete("/{media_id}")
async def delete_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a media file from a capsule.
    Only works if capsule is not yet unlocked.
    """

    # Get media record
    media_response = supabase_admin.table("media")\
        .select("*, capsules(*)")\
        .eq("id", media_id)\
        .execute()

    if not media_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    media = media_response.data[0]
    capsule = media["capsules"]

    # Verify ownership
    if capsule["owner_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the capsule owner can delete media"
        )

    # Check if capsule is unlocked
    unlock_date = datetime.fromisoformat(
        capsule["unlock_date"].replace("Z", "+00:00"))
    is_unlocked = datetime.now(timezone.utc) >= unlock_date

    if is_unlocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete media from an unlocked capsule"
        )

    try:
        # Delete from storage
        supabase_admin.storage.from_(settings.STORAGE_BUCKET).remove(
            [media["file_path"]])

        # Delete from database
        supabase_admin.table("media").delete().eq("id", media_id).execute()

        return {"message": "Media deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete media: {str(e)}"
        )
