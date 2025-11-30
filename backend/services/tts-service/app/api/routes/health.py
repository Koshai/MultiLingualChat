"""Health check endpoints."""

from fastapi import APIRouter
from app.services.tts_service import tts_service

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return await tts_service.health_check()


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "tts-service",
        "version": "1.0.0",
        "status": "running"
    }
