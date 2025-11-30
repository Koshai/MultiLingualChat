"""Configuration management for TTS service."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # Azure Text-to-Speech
    azure_speech_key: str = ""
    azure_speech_region: str = "eastus"

    # Service configuration
    tts_service_host: str = "0.0.0.0"
    tts_service_port: int = 3005

    # Fallback configuration
    enable_piper_fallback: bool = False
    piper_model_path: str = "./models/piper"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
