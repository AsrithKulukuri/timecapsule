from supabase import create_client, Client
from .config import settings

# Main Supabase client (uses anon key)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Admin client (uses service role key for bypassing RLS)
supabase_admin: Client = create_client(
    settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
