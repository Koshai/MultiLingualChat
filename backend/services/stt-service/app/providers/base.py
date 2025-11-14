"""Base class for STT providers."""

from abc import ABC, abstractmethod
from typing import Optional
from app.models.transcription import TranscriptionRequest, TranscriptionResponse


class BaseSTTProvider(ABC):
    """Abstract base class for speech-to-text providers."""

    def __init__(self, name: str):
        self.name = name
        self.initialized = False

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the provider."""
        pass

    @abstractmethod
    async def transcribe(self, request: TranscriptionRequest) -> TranscriptionResponse:
        """
        Transcribe audio to text.

        Args:
            request: TranscriptionRequest with audio data and options

        Returns:
            TranscriptionResponse with transcribed text and metadata
        """
        pass

    @abstractmethod
    async def health_check(self) -> dict:
        """Check provider health status."""
        pass

    @abstractmethod
    async def cleanup(self) -> None:
        """Cleanup provider resources."""
        pass
