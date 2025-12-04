from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Get the root directory (3 levels up from this file)
ROOT_DIR = Path(__file__).parent.parent.parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):
    # Basic app settings
    APP_NAME: str = "Translation Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("TRANSLATION_SERVICE_PORT", 3003))

    # Translation Provider Selection
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "argos")  # argos, google, deepl, azure

    # Argos Translate (Local/Free) - currently in use
    # No configuration needed - uses installed packages

    # LibreTranslate settings (Alternative local option)
    LIBRETRANSLATE_URL: str = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")
    LIBRETRANSLATE_API_KEY: str = os.getenv("LIBRETRANSLATE_API_KEY", "")

    # Cloud Provider Configuration (Commercial - for production)
    # Google Cloud Translation
    GOOGLE_CLOUD_PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "")
    GOOGLE_CLOUD_CREDENTIALS_PATH: str = os.getenv("GOOGLE_CLOUD_CREDENTIALS_PATH", "")

    # DeepL API (Best quality for supported languages)
    DEEPL_API_KEY: str = os.getenv("DEEPL_API_KEY", "")
    DEEPL_API_FREE: bool = os.getenv("DEEPL_API_FREE", "true").lower() == "true"

    # Azure Translator
    AZURE_TRANSLATOR_KEY: str = os.getenv("AZURE_TRANSLATOR_KEY", "")
    AZURE_TRANSLATOR_REGION: str = os.getenv("AZURE_TRANSLATOR_REGION", "")

    # Redis settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: int = int(os.getenv("REDIS_DB", 0))

    # Cache settings
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", 86400))  # 24 hours
    CACHE_MAX_SIZE: int = int(os.getenv("CACHE_MAX_SIZE", 10000))

    # Translation settings
    MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", 5000))
    TRANSLATION_TIMEOUT: int = int(os.getenv("TRANSLATION_TIMEOUT", 30))
    RETRY_ATTEMPTS: int = int(os.getenv("RETRY_ATTEMPTS", 3))

    # CORS settings - Support wildcard for Ngrok/development
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Get CORS origins, supporting wildcard for development."""
        cors_env = os.getenv("CORS_ORIGIN", "")
        if cors_env == "*":
            return ["*"]
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ]

    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = [
        "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko",
        "ar", "hi", "bn", "tr", "pl", "nl", "sv", "da", "no", "fi"
    ]

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", 100))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", 3600))  # 1 hour

    # Monitoring
    ENABLE_METRICS: bool = os.getenv("ENABLE_METRICS", "true").lower() == "true"
    METRICS_PORT: int = int(os.getenv("METRICS_PORT", 8080))

    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars from root .env

settings = Settings()