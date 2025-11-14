from pydantic_settings import BaseSettings
from typing import Literal
import os
from pathlib import Path

# Get the root directory (load from root .env)
# Path: config.py -> core -> app -> stt-service -> services -> backend -> MultilingualChat
ROOT_DIR = Path(__file__).parent.parent.parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service Configuration
    SERVICE_NAME: str = "stt-service"
    HOST: str = "0.0.0.0"
    PORT: int = 3004

    # STT Provider Selection
    STT_PROVIDER: Literal["whisper", "google", "azure_speech", "aws"] = "azure_speech"

    # Whisper Model Configuration (Local/Free)
    WHISPER_MODEL: Literal["tiny", "base", "small", "medium", "large"] = "medium"

    # Cloud Provider Configuration (Commercial - for production)
    # Google Cloud Speech-to-Text
    GOOGLE_CLOUD_PROJECT_ID: str = ""
    GOOGLE_CLOUD_CREDENTIALS_PATH: str = ""

    # Azure Speech Service
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = ""

    # AWS Transcribe
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"

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
        env_file = str(ENV_FILE)
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars from root .env


settings = Settings()
