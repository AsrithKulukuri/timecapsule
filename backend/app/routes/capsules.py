from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import CapsuleCreate, CapsuleUpdate, CapsuleResponse
from ..dependencies import get_current_user
from ..services.capsule_service import CapsuleService
from ..services.email_service import EmailService
from ..supabase_client import supabase_admin
from datetime import datetime, timezone

router = APIRouter()


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_capsule(
    capsule_data: CapsuleCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new time capsule.
    Can be personal or group capsule.
    """
    try:
        print(f"Creating capsule for user {current_user['id']}")
        print(f"Capsule data: {capsule_data}")

        capsule = await CapsuleService.create_capsule(capsule_data, current_user["id"])
        print(f"Capsule created: {capsule}")

        # Send creation notification email
        if current_user.get("email"):
            sent = EmailService.send_capsule_created_email(
                current_user["email"], capsule)
            if sent:
                supabase_admin.table("capsules")\
                    .update({"created_email_sent_at": datetime.now(timezone.utc).isoformat()})\
                    .eq("id", capsule["id"])\
                    .execute()
        return capsule
    except Exception as e:
        print(f"Capsule creation error: {type(e).__name__}: {str(e)}")
        raise


@router.get("/", response_model=List[dict])
async def get_capsules(current_user: dict = Depends(get_current_user)):
    """
    Get all capsules owned by or shared with the current user.
    Includes unlock status for each capsule.
    """
    capsules = await CapsuleService.get_user_capsules(current_user["id"])
    return capsules


@router.get("/{capsule_id}", response_model=dict)
async def get_capsule(
    capsule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific capsule by ID.
    Enforces access control (owner or group member only).
    Media URLs are hidden if capsule is still locked.
    """
    capsule = await CapsuleService.get_capsule_by_id(capsule_id, current_user["id"])
    return capsule


@router.put("/{capsule_id}", response_model=dict)
async def update_capsule(
    capsule_id: str,
    update_data: CapsuleUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a capsule (title, description, or unlock date).
    Only the owner can update.
    Cannot update after unlock date has passed.
    """
    capsule = await CapsuleService.update_capsule(capsule_id, current_user["id"], update_data)
    return capsule


@router.delete("/{capsule_id}")
async def delete_capsule(
    capsule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a capsule and all its associated media.
    Only the owner can delete.
    """
    result = await CapsuleService.delete_capsule(capsule_id, current_user["id"])
    return result
