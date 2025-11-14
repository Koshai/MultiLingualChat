"""Whisper STT provider implementation (local/fallback)."""

import whisper
import torch
import numpy as np
import base64
import tempfile
import os
import time
import uuid
from typing import Optional
import structlog

from app.providers.base import BaseSTTProvider
from app.models.transcription import (
    TranscriptionRequest,
    TranscriptionResponse,
    TranscriptionSegment
)

logger = structlog.get_logger(__name__)


class WhisperProvider(BaseSTTProvider):
    """Local Whisper STT provider (fallback option)."""

    def __init__(
        self,
        model_name: str = "medium",
        device: str = "cpu"
    ):
        super().__init__("whisper")
        self.model_name = model_name
        self.device = device
        self.model = None

    async def initialize(self) -> None:
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

            self.initialized = True

            logger.info(
                "Whisper model loaded successfully",
                model=self.model_name,
                device=self.device
            )

        except Exception as e:
            self.initialized = False
            logger.error("Failed to load Whisper model", error=str(e))
            raise

    async def transcribe(
        self,
        request: TranscriptionRequest
    ) -> TranscriptionResponse:
        """Transcribe audio data using Whisper."""
        if not self.initialized or not self.model:
            raise RuntimeError("Whisper model not initialized")

        start_time = time.time()
        transcription_id = str(uuid.uuid4())
        temp_file_path = None

        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(request.audio_data)

            # Save to temporary file (Whisper will use ffmpeg to convert)
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file_path = temp_file.name
            temp_file.write(audio_bytes)
            temp_file.close()

            # Transcribe with Whisper
            logger.info(
                "Transcribing audio with Whisper",
                transcription_id=transcription_id,
                audio_size_bytes=len(audio_bytes),
                language=request.language
            )

            # Prepare transcription options with enhanced settings
            options = {
                "fp16": False if self.device == "cpu" else True,
                "verbose": False,
                # Enhanced decode options for better accuracy
                "temperature": 0.0,  # More deterministic, less creative
                "compression_ratio_threshold": 2.4,  # Reject low-quality transcriptions
                "logprob_threshold": -1.0,  # Filter low-confidence words
                "no_speech_threshold": 0.6,  # Better silence detection
                "condition_on_previous_text": True,  # Use context from previous segments
                "initial_prompt": None,  # Can add context-specific prompts if needed
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
                "Whisper transcription completed",
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
                "Whisper transcription failed",
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

    async def health_check(self) -> dict:
        """Get Whisper provider health status."""
        return {
            "status": "healthy" if self.initialized else "unhealthy",
            "provider": self.name,
            "model": self.model_name,
            "device": self.device
        }

    async def cleanup(self) -> None:
        """Cleanup Whisper resources."""
        if self.model:
            del self.model
            self.model = None
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
            logger.info("Whisper model resources cleaned up")
