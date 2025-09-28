from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TranslationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CACHED = "cached"

class SupportedLanguage(BaseModel):
    code: str = Field(..., description="ISO 639-1 language code")
    name: str = Field(..., description="Language name")

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    source_language: str = Field(..., min_length=2, max_length=5, description="Source language code")
    target_language: str = Field(..., min_length=2, max_length=5, description="Target language code")
    message_id: Optional[str] = Field(None, description="Associated message ID")
    user_id: Optional[str] = Field(None, description="User requesting translation")

    @validator('source_language', 'target_language')
    def validate_language_codes(cls, v):
        if len(v) != 2:
            raise ValueError('Language code must be 2 characters')
        return v.lower()

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class TranslationResponse(BaseModel):
    id: str = Field(..., description="Translation request ID")
    text: str = Field(..., description="Original text")
    translated_text: str = Field(..., description="Translated text")
    source_language: str = Field(..., description="Source language code")
    target_language: str = Field(..., description="Target language code")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Translation confidence score")
    status: TranslationStatus = Field(..., description="Translation status")
    cached: bool = Field(False, description="Whether result was from cache")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    message_id: Optional[str] = Field(None, description="Associated message ID")

class BatchTranslationRequest(BaseModel):
    requests: List[TranslationRequest] = Field(..., min_items=1, max_items=50)
    priority: Optional[str] = Field("normal", description="Processing priority")

class BatchTranslationResponse(BaseModel):
    batch_id: str = Field(..., description="Batch processing ID")
    total_requests: int = Field(..., description="Total number of requests")
    completed: int = Field(..., description="Number of completed translations")
    failed: int = Field(..., description="Number of failed translations")
    translations: List[TranslationResponse] = Field(..., description="Translation results")
    total_processing_time_ms: int = Field(..., description="Total processing time")

class TranslationStats(BaseModel):
    total_translations: int = Field(..., description="Total translations processed")
    cache_hits: int = Field(..., description="Number of cache hits")
    cache_hit_rate: float = Field(..., description="Cache hit rate percentage")
    average_processing_time_ms: float = Field(..., description="Average processing time")
    popular_language_pairs: List[Dict[str, Any]] = Field(..., description="Most popular language pairs")
    error_rate: float = Field(..., description="Error rate percentage")

class HealthCheck(BaseModel):
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(..., description="Service version")
    dependencies: Dict[str, str] = Field(..., description="Dependency status")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = Field(None, description="Request ID for tracking")