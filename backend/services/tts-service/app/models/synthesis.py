"""Data models for TTS synthesis."""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class SynthesisRequest(BaseModel):
    """Request model for text-to-speech synthesis."""

    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=5000)
    language: str = Field(default="en", description="Target language code (ISO 639-1)")
    voice: Optional[str] = Field(default=None, description="Voice identifier (provider-specific)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech rate (0.5-2.0)")
    pitch: float = Field(default=1.0, ge=0.5, le=2.0, description="Voice pitch (0.5-2.0)")

    # Optional metadata
    meeting_id: Optional[str] = None
    user_id: Optional[str] = None
    transcription_id: Optional[str] = None


class SynthesisResponse(BaseModel):
    """Response model for synthesized speech."""

    id: str = Field(..., description="Unique synthesis ID")
    audio_data: str = Field(..., description="Base64-encoded audio data")
    format: Literal["mp3", "wav"] = Field(..., description="Audio format")
    language: str = Field(..., description="Language code")
    duration_seconds: float = Field(..., description="Audio duration in seconds")
    provider: str = Field(..., description="TTS provider used (azure_tts, piper, etc.)")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")

    # Optional metadata
    meeting_id: Optional[str] = None
    user_id: Optional[str] = None
    transcription_id: Optional[str] = None


class HealthCheckResponse(BaseModel):
    """Health check response."""

    status: str
    provider: str
    details: Optional[str] = None
