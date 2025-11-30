"""Base class for TTS providers."""

from abc import ABC, abstractmethod
from app.models.synthesis import SynthesisRequest, SynthesisResponse


class BaseTTSProvider(ABC):
    """Abstract base class for TTS providers."""

    def __init__(self, name: str):
        self.name = name
        self.initialized = False

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the TTS provider."""
        pass

    @abstractmethod
    async def synthesize(self, request: SynthesisRequest) -> SynthesisResponse:
        """
        Synthesize speech from text.

        Args:
            request: Synthesis request with text and parameters

        Returns:
            SynthesisResponse with base64-encoded audio data
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

    def is_ready(self) -> bool:
        """Check if provider is ready to use."""
        return self.initialized
