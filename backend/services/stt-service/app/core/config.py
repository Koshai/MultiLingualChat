from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service Configuration
    SERVICE_NAME: str = "stt-service"
    HOST: str = "0.0.0.0"
    PORT: int = 3004

    # Whisper Model Configuration
    WHISPER_MODEL: Literal["tiny", "base", "small", "medium", "large"] = "base"

    # Audio Processing
    MAX_AUDIO_LENGTH_SECONDS: int = 30
    SAMPLE_RATE: int = 16000

    # Performance
    DEVICE: Literal["cpu", "cuda"] = "cpu"

    # Logging
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
