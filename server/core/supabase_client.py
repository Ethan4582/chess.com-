from supabase import create_client, Client
from .config import settings
import logging

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """
    Initializes a Supabase client with Service Role privileges.
    This allows the backend to perform administrative tasks (referee).
    """
    try:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        
        if not url or not key:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing!")

        return create_client(url, key)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise e

# Global singleton client
supabase: Client = get_supabase_client()
