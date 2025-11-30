"""TTS synthesis endpoints."""

from fastapi import APIRouter, HTTPException
from app.models.synthesis import SynthesisRequest, SynthesisResponse
from app.services.tts_service import tts_service
import structlog

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.post("/synthesize", response_model=SynthesisResponse)
async def synthesize_speech(request: SynthesisRequest):
    """
    Synthesize speech from text.

    Args:
        request: Synthesis request with text and parameters

    Returns:
        SynthesisResponse with base64-encoded audio data

    Raises:
        HTTPException: If synthesis fails
    """
    try:
        logger.info(
            "Synthesis endpoint called",
            text_length=len(request.text),
            language=request.language
        )

        result = await tts_service.synthesize(request)

        logger.info(
            "Synthesis endpoint completed",
            synthesis_id=result.id,
            provider=result.provider,
            processing_time_ms=result.processing_time_ms
        )

        return result

    except Exception as e:
        logger.error(
            "Synthesis endpoint failed",
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Speech synthesis failed: {str(e)}"
        )
