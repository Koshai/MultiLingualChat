from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TranscriptionRequest(BaseModel):
    """Request model for audio transcription."""
    audio_data: str = Field(..., description="Base64 encoded audio data")
    language: Optional[str] = Field(None, description="ISO 639-1 language code (e.g., 'en', 'es')")
    meeting_id: Optional[str] = Field(None, description="Meeting ID for context")
    user_id: Optional[str] = Field(None, description="User ID for tracking")


class TranscriptionSegment(BaseModel):
    """Individual segment of transcribed text."""
    id: int
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    text: str
    confidence: Optional[float] = Field(None, description="Confidence score 0-1")


class TranscriptionResponse(BaseModel):
    """Response model for transcription results."""
    id: str = Field(..., description="Unique transcription ID")
    text: str = Field(..., description="Full transcribed text")
    language: str = Field(..., description="Detected or specified language")
    segments: List[TranscriptionSegment] = Field(default_factory=list)
    confidence: Optional[float] = Field(None, description="Overall confidence")
    processing_time_ms: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    meeting_id: Optional[str] = None
    user_id: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model: str
    device: str
    uptime_seconds: float
