from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Basic app settings
    APP_NAME: str = "Translation Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("TRANSLATION_SERVICE_PORT", 3003))

    # LibreTranslate settings
    LIBRETRANSLATE_URL: str = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")
    LIBRETRANSLATE_API_KEY: str = os.getenv("LIBRETRANSLATE_API_KEY", "")

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

    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]

    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = [
        "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko",
        "ar", "hi", "tr", "pl", "nl", "sv", "da", "no", "fi"
    ]

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", 100))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", 3600))  # 1 hour

    # Monitoring
    ENABLE_METRICS: bool = os.getenv("ENABLE_METRICS", "true").lower() == "true"
    METRICS_PORT: int = int(os.getenv("METRICS_PORT", 8080))

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()