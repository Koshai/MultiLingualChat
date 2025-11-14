from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import base64
import structlog

from app.models.transcription import TranscriptionRequest, TranscriptionResponse
from app.services.stt_service import stt_service

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio data using Azure Speech or Whisper (fallback).

    Accepts base64-encoded audio data and returns transcribed text.
    """
    logger.info(
        "Transcription request received",
        language=request.language,
        meeting_id=request.meeting_id,
        user_id=request.user_id,
        audio_data_length=len(request.audio_data) if request.audio_data else 0
    )

    try:
        result = await stt_service.transcribe(request)

        logger.info(
            "Transcription successful",
            text_length=len(result.text) if result.text else 0,
            language=result.language,
            processing_time_ms=result.processing_time_ms
        )

        return result
    except ValueError as e:
        logger.error("Invalid audio format", error=str(e), exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(
            "Transcription error - FULL DETAILS",
            error=str(e),
            error_type=type(e).__name__,
            language=request.language,
            meeting_id=request.meeting_id,
            exc_info=True
        )
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcribe/file", response_model=TranscriptionResponse)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None),
    meeting_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """
    Transcribe an uploaded audio file.

    Supports WAV, MP3, FLAC, and other common audio formats.
    """
    try:
        # Read file contents
        audio_bytes = await file.read()

        # Encode to base64
        audio_data = base64.b64encode(audio_bytes).decode('utf-8')

        # Create request
        request = TranscriptionRequest(
            audio_data=audio_data,
            language=language,
            meeting_id=meeting_id,
            user_id=user_id
        )

        # Transcribe
        result = await stt_service.transcribe(request)
        return result

    except ValueError as e:
        logger.error("Invalid audio file", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("File transcription error", error=str(e))
        raise HTTPException(status_code=500, detail="Transcription failed")
