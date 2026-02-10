from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from ..supabase_client import supabase, supabase_admin
from ..schemas import CapsuleCreate, CapsuleUpdate, CapsuleResponse


class CapsuleService:

    @staticmethod
    async def create_capsule(capsule_data: CapsuleCreate, user_id: str) -> dict:
        """Create a new time capsule"""

        # Validate unlock date is in the future
        if capsule_data.unlock_date <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unlock date must be in the future"
            )

        try:
            # Prepare capsule data
            capsule_dict = {
                "title": capsule_data.title,
                "description": capsule_data.description,
                "unlock_date": capsule_data.unlock_date.isoformat(),
                "owner_id": user_id,
                "is_group": capsule_data.is_group,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            print(f"Inserting capsule: {capsule_dict}")

            # Insert capsule
            response = supabase_admin.table(
                "capsules").insert(capsule_dict).execute()

            print(f"Insert response: {response}")
            print(
                f"Response data: {response.data if hasattr(response, 'data') else 'NO DATA ATTR'}")

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create capsule"
                )

            capsule = response.data[0]

            # If group capsule, add members
            if capsule_data.is_group and capsule_data.group_members:
                members_data = [
                    {
                        "capsule_id": capsule["id"],
                        "user_id": member_id
                    }
                    for member_id in capsule_data.group_members
                ]
                supabase_admin.table("capsule_members").insert(
                    members_data).execute()

            return capsule
        except HTTPException:
            raise
        except Exception as e:
            print(
                f"Capsule creation database error: {type(e).__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create capsule: {str(e)}"
            )

    @staticmethod
    async def get_user_capsules(user_id: str) -> List[dict]:
        """Get all capsules owned by or shared with the user"""

        # Get owned capsules
        # Use !media_capsule_id_fkey to specify which foreign key relationship to use
        owned = supabase_admin.table("capsules")\
            .select("*, media!media_capsule_id_fkey(*)")\
            .eq("owner_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        # Get shared capsules (via group membership)
        shared_response = supabase_admin.table("capsule_members")\
            .select("capsule_id")\
            .eq("user_id", user_id)\
            .execute()

        shared_ids = [item["capsule_id"] for item in shared_response.data]

        shared_capsules = []
        if shared_ids:
            shared = supabase_admin.table("capsules")\
                .select("*, media!media_capsule_id_fkey(*)")\
                .in_("id", shared_ids)\
                .execute()
            shared_capsules = shared.data

        # Combine and check unlock status
        all_capsules = owned.data + shared_capsules

        for capsule in all_capsules:
            unlock_date = datetime.fromisoformat(
                capsule["unlock_date"].replace("Z", "+00:00"))
            capsule["is_unlocked"] = datetime.utcnow(
            ) >= unlock_date.replace(tzinfo=None)

        return all_capsules

    @staticmethod
    async def get_capsule_by_id(capsule_id: str, user_id: str) -> dict:
        """Get a specific capsule with access control"""

        response = supabase_admin.table("capsules")\
            .select("*, media!media_capsule_id_fkey(*)")\
            .eq("id", capsule_id)\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capsule not found"
            )

        capsule = response.data[0]

        # Check access rights
        is_owner = capsule["owner_id"] == user_id

        # Check if user is a group member
        is_member = False
        if capsule["is_group"]:
            member_check = supabase_admin.table("capsule_members")\
                .select("*")\
                .eq("capsule_id", capsule_id)\
                .eq("user_id", user_id)\
                .execute()
            is_member = len(member_check.data) > 0

        if not is_owner and not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this capsule"
            )

        # Check if unlocked
        unlock_date = datetime.fromisoformat(
            capsule["unlock_date"].replace("Z", "+00:00"))
        capsule["is_unlocked"] = datetime.utcnow(
        ) >= unlock_date.replace(tzinfo=None)

        # If locked, hide media URLs
        if not capsule["is_unlocked"] and capsule.get("media"):
            for media in capsule["media"]:
                media["file_url"] = None

        return capsule

    @staticmethod
    async def update_capsule(
        capsule_id: str,
        user_id: str,
        update_data: CapsuleUpdate
    ) -> dict:
        """Update a capsule (only if not unlocked yet)"""

        # Get capsule and verify ownership
        capsule = await CapsuleService.get_capsule_by_id(capsule_id, user_id)

        if capsule["owner_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can update this capsule"
            )

        if capsule["is_unlocked"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update an unlocked capsule"
            )

        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict(
            exclude_unset=True).items()}

        if "unlock_date" in update_dict:
            if update_dict["unlock_date"] <= datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unlock date must be in the future"
                )
            update_dict["unlock_date"] = update_dict["unlock_date"].isoformat()

        # Update capsule
        response = supabase_admin.table("capsules")\
            .update(update_dict)\
            .eq("id", capsule_id)\
            .execute()

        return response.data[0] if response.data else capsule

    @staticmethod
    async def delete_capsule(capsule_id: str, user_id: str):
        """Delete a capsule and its media"""

        # Verify ownership
        capsule = await CapsuleService.get_capsule_by_id(capsule_id, user_id)

        if capsule["owner_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can delete this capsule"
            )

        # Delete media files from storage
        if capsule.get("media"):
            for media in capsule["media"]:
                try:
                    supabase_admin.storage.from_(
                        "capsule-media").remove([media["file_path"]])
                except:
                    pass  # Continue even if file deletion fails

        # Delete capsule (cascade will delete media records and members)
        supabase_admin.table("capsules").delete().eq(
            "id", capsule_id).execute()

        return {"message": "Capsule deleted successfully"}
