from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Header, HTTPException, status
from app.config import settings
from app.supabase_client import supabase_admin
from app.services.email_service import EmailService

router = APIRouter()


@router.post("/reminders")
async def send_unlock_reminders(x_notify_secret: str = Header(None)):
    """
    Trigger reminder emails for capsules unlocking within the next window.
    Intended for cron usage.
    """
    if not x_notify_secret or x_notify_secret != settings.NOTIFY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(hours=settings.NOTIFY_WINDOW_HOURS)

    response = supabase_admin.table("capsules")\
        .select("*")\
        .gt("unlock_date", now.isoformat())\
        .lte("unlock_date", window_end.isoformat())\
        .is_("reminder_email_sent_at", "null")\
        .execute()

    sent_count = 0
    for capsule in response.data or []:
        user_response = supabase_admin.auth.admin.get_user_by_id(
            capsule["owner_id"])
        user_obj = getattr(user_response, "user", None)
        if not user_obj and isinstance(user_response, dict):
            user_obj = user_response.get("user")
        user_email = getattr(user_obj, "email", None) if user_obj else None
        if not user_email:
            continue

        sent = EmailService.send_capsule_reminder_email(user_email, capsule)
        if sent:
            supabase_admin.table("capsules")\
                .update({"reminder_email_sent_at": now.isoformat()})\
                .eq("id", capsule["id"])\
                .execute()
            sent_count += 1

    return {"sent": sent_count}
