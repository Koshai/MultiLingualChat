from fastapi import APIRouter
from app.models.transcription import HealthResponse
from app.services.whisper_service import whisper_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check STT service health status."""
    health = await whisper_service.get_health()
    return health


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Speech-to-Text Service",
        "status": "running",
        "model": whisper_service.model_name
    }
