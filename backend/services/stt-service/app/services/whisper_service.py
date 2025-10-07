import whisper
import torch
import numpy as np
import base64
import io
import time
import uuid
import tempfile
import os
from typing import Optional
import structlog
from scipy.io import wavfile

from app.core.config import settings
from app.models.transcription import (
    TranscriptionRequest,
    TranscriptionResponse,
    TranscriptionSegment
)

logger = structlog.get_logger(__name__)


class WhisperService:
    """Service for speech-to-text transcription using OpenAI Whisper."""

    def __init__(self):
        self.model = None
        self.device = settings.DEVICE
        self.model_name = settings.WHISPER_MODEL
        self.start_time = time.time()

    async def initialize(self):
        """Load the Whisper model."""
        try:
            logger.info(
                "Loading Whisper model",
                model=self.model_name,
                device=self.device
            )

            # Load model
            self.model = whisper.load_model(
                self.model_name,
                device=self.device
            )

            logger.info(
                "Whisper model loaded successfully",
                model=self.model_name,
                device=self.device
            )

        except Exception as e:
            logger.error("Failed to load Whisper model", error=str(e))
            raise

    async def transcribe(
        self,
        request: TranscriptionRequest
    ) -> TranscriptionResponse:
        """Transcribe audio data using Whisper."""
        start_time = time.time()
        transcription_id = str(uuid.uuid4())
        temp_file_path = None

        try:
            if not self.model:
                raise RuntimeError("Whisper model not initialized")

            # Decode base64 audio data
            audio_bytes = base64.b64decode(request.audio_data)

            # Save to temporary file (Whisper will use ffmpeg to convert)
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file_path = temp_file.name
            temp_file.write(audio_bytes)
            temp_file.close()

            # Transcribe with Whisper
            logger.info(
                "Transcribing audio",
                transcription_id=transcription_id,
                audio_size_bytes=len(audio_bytes),
                language=request.language
            )

            # Prepare transcription options
            options = {
                "fp16": False if self.device == "cpu" else True,
                "verbose": False
            }

            if request.language:
                options["language"] = request.language

            # Perform transcription using file path
            result = self.model.transcribe(
                temp_file_path,
                **options
            )

            # Extract segments
            segments = []
            if "segments" in result:
                for i, seg in enumerate(result["segments"]):
                    segments.append(TranscriptionSegment(
                        id=i,
                        start=seg["start"],
                        end=seg["end"],
                        text=seg["text"].strip(),
                        confidence=seg.get("confidence")
                    ))

            processing_time = int((time.time() - start_time) * 1000)

            # Build response
            response = TranscriptionResponse(
                id=transcription_id,
                text=result["text"].strip(),
                language=result.get("language", request.language or "unknown"),
                segments=segments,
                processing_time_ms=processing_time,
                meeting_id=request.meeting_id,
                user_id=request.user_id
            )

            logger.info(
                "Transcription completed",
                transcription_id=transcription_id,
                text_length=len(response.text),
                language=response.language,
                processing_time_ms=processing_time,
                segments_count=len(segments)
            )

            return response

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(
                "Transcription failed",
                transcription_id=transcription_id,
                error=str(e),
                processing_time_ms=processing_time
            )
            raise
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    logger.warning("Failed to delete temp file", error=str(e))

    def _bytes_to_audio_array(self, audio_bytes: bytes) -> np.ndarray:
        """Convert audio bytes to numpy array."""
        try:
            # Try to load as WAV file
            audio_io = io.BytesIO(audio_bytes)
            sample_rate, audio_data = wavfile.read(audio_io)

            # Convert to float32 and normalize
            if audio_data.dtype == np.int16:
                audio_data = audio_data.astype(np.float32) / 32768.0
            elif audio_data.dtype == np.int32:
                audio_data = audio_data.astype(np.float32) / 2147483648.0

            # Convert stereo to mono if needed
            if len(audio_data.shape) > 1:
                audio_data = audio_data.mean(axis=1)

            # Resample if needed
            if sample_rate != settings.SAMPLE_RATE:
                # Simple resampling (for production, use librosa or scipy.signal.resample)
                from scipy import signal
                num_samples = int(len(audio_data) * settings.SAMPLE_RATE / sample_rate)
                audio_data = signal.resample(audio_data, num_samples)

            return audio_data

        except Exception as e:
            logger.error("Failed to process audio bytes", error=str(e))
            raise ValueError(f"Invalid audio format: {str(e)}")

    async def get_health(self) -> dict:
        """Get service health status."""
        return {
            "status": "healthy" if self.model else "unhealthy",
            "model": self.model_name,
            "device": self.device,
            "uptime_seconds": time.time() - self.start_time
        }


# Global service instance
whisper_service = WhisperService()
