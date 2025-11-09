"""Base translation provider interface."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import structlog

logger = structlog.get_logger(__name__)


class BaseTranslationProvider(ABC):
    """Base class for all translation providers."""

    def __init__(self, name: str):
        self.name = name
        self.initialized = False

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the provider (load models, check API keys, etc.)."""
        pass

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """
        Translate text from source to target language.

        Returns:
            dict: {
                "translatedText": str,
                "confidence": float (0-1, optional)
            }
        """
        pass

    @abstractmethod
    async def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """
        Check provider health status.

        Returns:
            dict: {
                "status": "healthy" | "degraded" | "unhealthy",
                "details": str (optional)
            }
        """
        pass

    async def cleanup(self) -> None:
        """Cleanup resources (optional)."""
        pass
