import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Server Config
    PORT: int = 8080
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Use the root .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
