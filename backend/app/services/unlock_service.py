from datetime import datetime
from typing import List
from app.supabase_client import supabase_admin
import logging

logger = logging.getLogger(__name__)


class UnlockService:
    """
    Background service to automatically unlock capsules.
    This should be called periodically (e.g., via a cron job or background task).
    """

    @staticmethod
    async def unlock_ready_capsules() -> List[str]:
        """
        Find and unlock all capsules that have reached their unlock date.
        Returns list of unlocked capsule IDs.
        """
        try:
            # Get all capsules that should be unlocked but aren't yet
            current_time = datetime.utcnow().isoformat()

            response = supabase_admin.table("capsules")\
                .select("id, title, unlock_date")\
                .lte("unlock_date", current_time)\
                .execute()

            unlocked_ids = []

            for capsule in response.data:
                logger.info(
                    f"Capsule '{capsule['title']}' (ID: {capsule['id']}) is now unlocked")
                unlocked_ids.append(capsule["id"])

            logger.info(
                f"Processed {len(unlocked_ids)} capsules for unlocking")
            return unlocked_ids

        except Exception as e:
            logger.error(f"Error in unlock service: {str(e)}")
            return []

    @staticmethod
    def is_capsule_unlocked(unlock_date: str) -> bool:
        """
        Check if a capsule should be unlocked based on its unlock date.
        """
        unlock_dt = datetime.fromisoformat(unlock_date.replace("Z", "+00:00"))
        return datetime.utcnow() >= unlock_dt.replace(tzinfo=None)
