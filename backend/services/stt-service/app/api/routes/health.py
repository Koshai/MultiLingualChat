from fastapi import APIRouter
from app.services.stt_service import stt_service

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check STT service health status."""
    health = await stt_service.get_health()
    return health


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Speech-to-Text Service",
        "status": "running",
        "providers": "Azure Speech (primary), Whisper (fallback)"
    }
