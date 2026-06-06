import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env file explicitly
load_dotenv()

class SupabaseClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            # Debug output
            print(f"Loading Supabase credentials...")
            print(f"URL found: {bool(url)}")
            print(f"Key found: {bool(key)}")
            
            if not url or not key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in .env file.\n"
                    f"URL: {'✓' if url else '✗'}, KEY: {'✓' if key else '✗'}"
                )
            
            cls._instance = create_client(url, key)
            print("✅ Supabase client created successfully!")
        return cls._instance

supabase = SupabaseClient()
