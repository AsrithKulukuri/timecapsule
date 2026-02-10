from datetime import datetime
import logging
from typing import Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _is_configured() -> bool:
        return bool(settings.RESEND_API_KEY and settings.RESEND_FROM)

    @staticmethod
    def send_email(to_email: str, subject: str, html: str, text: Optional[str] = None) -> bool:
        if not EmailService._is_configured():
            logger.warning("Email not configured. Skipping send.")
            return False

        payload = {
            "from": settings.RESEND_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
        if text:
            payload["text"] = text

        try:
            response = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=10.0,
            )
            if response.status_code >= 400:
                logger.error("Resend error: %s", response.text)
                return False
            return True
        except Exception as exc:
            logger.error("Email send failed: %s", str(exc))
            return False

    @staticmethod
    def send_capsule_created_email(to_email: str, capsule: dict) -> bool:
        unlock_date = capsule.get("unlock_date")
        subject = "Your time capsule is created"
        html = f"""
        <div>
            <h2>Time Capsule Created</h2>
            <p>Your capsule <strong>{capsule.get('title')}</strong> is saved.</p>
            <p>Unlock date: {unlock_date}</p>
            <p>We will remind you 24 hours before it unlocks.</p>
        </div>
        """
        text = (
            f"Your capsule '{capsule.get('title')}' is saved. "
            f"Unlock date: {unlock_date}. We will remind you 24 hours before it unlocks."
        )
        return EmailService.send_email(to_email, subject, html, text)

    @staticmethod
    def send_capsule_reminder_email(to_email: str, capsule: dict) -> bool:
        unlock_date = capsule.get("unlock_date")
        subject = "Your time capsule unlocks soon"
        html = f"""
        <div>
            <h2>Unlock Reminder</h2>
            <p>Your capsule <strong>{capsule.get('title')}</strong> unlocks in about 24 hours.</p>
            <p>Unlock date: {unlock_date}</p>
            <p>Get ready to open it!</p>
        </div>
        """
        text = (
            f"Your capsule '{capsule.get('title')}' unlocks in about 24 hours. "
            f"Unlock date: {unlock_date}."
        )
        return EmailService.send_email(to_email, subject, html, text)
