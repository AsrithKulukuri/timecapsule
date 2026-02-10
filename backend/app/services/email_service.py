from datetime import datetime
import logging
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _is_configured() -> bool:
        return bool(settings.SENDGRID_API_KEY and settings.SENDGRID_FROM)

    @staticmethod
    def send_email(to_email: str, subject: str, html: str, text: Optional[str] = None) -> bool:
        if not EmailService._is_configured():
            logger.warning("Email not configured. Skipping send.")
            return False

        logger.info(f"Sending email to {to_email} with subject: {subject}")

        try:
            message = Mail(
                from_email=settings.SENDGRID_FROM,
                to_emails=to_email,
                subject=subject,
                html_content=html
            )

            if text:
                message.plain_text_content = text

            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)

            logger.info(f"SendGrid response status: {response.status_code}")

            if response.status_code >= 400:
                logger.error(f"SendGrid error: {response.body}")
                return False

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as exc:
            logger.error(f"Email send failed: {str(exc)}", exc_info=True)
            return False

    @staticmethod
    def send_verification_email(to_email: str, verification_code: str) -> bool:
        html = f"""
        <h1>Verify Your Email</h1>
        <p>Welcome to Time Capsule! Please verify your email to get started.</p>
        <p><strong>Your verification code is:</strong></p>
        <h2 style="background: #f0f0f0; padding: 10px; border-radius: 5px;">{verification_code}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create a Time Capsule account, please ignore this email.</p>
        """
        text = f"Verify your email with this code: {verification_code}"
        return EmailService.send_email(to_email, "Verify Your Time Capsule Email", html, text)

    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> bool:
        html = f"""
        <h1>Your OTP Code</h1>
        <p>Use this code to login to Time Capsule:</p>
        <h2 style="background: #f0f0f0; padding: 10px; border-radius: 5px;">{otp_code}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        """
        text = f"Your Time Capsule OTP is: {otp_code} (expires in 10 minutes)"
        return EmailService.send_email(to_email, "Your Time Capsule OTP", html, text)

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
