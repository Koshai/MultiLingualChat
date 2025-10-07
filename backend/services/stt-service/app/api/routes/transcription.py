from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import base64
import structlog

from app.models.transcription import TranscriptionRequest, TranscriptionResponse
from app.services.whisper_service import whisper_service

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio data using Whisper.

    Accepts base64-encoded audio data and returns transcribed text.
    """
    try:
        result = await whisper_service.transcribe(request)
        return result
    except ValueError as e:
        logger.error("Invalid audio format", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Transcription error", error=str(e))
        raise HTTPException(status_code=500, detail="Transcription failed")


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
        result = await whisper_service.transcribe(request)
        return result

    except ValueError as e:
        logger.error("Invalid audio file", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("File transcription error", error=str(e))
        raise HTTPException(status_code=500, detail="Transcription failed")
