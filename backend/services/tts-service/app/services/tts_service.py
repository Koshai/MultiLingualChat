"""Main TTS service orchestration."""

import structlog
from typing import Optional, List
from app.providers.base import BaseTTSProvider
from app.providers.azure_tts import AzureTTSProvider
from app.models.synthesis import SynthesisRequest, SynthesisResponse
from app.core.config import settings

logger = structlog.get_logger(__name__)


class TTSService:
    """
    Main TTS service with multi-provider fallback support.

    Provider priority:
    1. Azure TTS (primary, cloud, high quality)
    """

    def __init__(self):
        self.providers: List[BaseTTSProvider] = []
        self.primary_provider: Optional[BaseTTSProvider] = None

    async def initialize(self) -> None:
        """Initialize all TTS providers."""
        logger.info("Initializing TTS service...")

        # Initialize Azure TTS (primary)
        if settings.azure_speech_key:
            azure_provider = AzureTTSProvider(
                subscription_key=settings.azure_speech_key,
                region=settings.azure_speech_region
            )
            await azure_provider.initialize()

            if azure_provider.is_ready():
                self.providers.append(azure_provider)
                self.primary_provider = azure_provider
                logger.info("Azure TTS provider initialized successfully")
            else:
                logger.warning("Azure TTS provider failed to initialize")
        else:
            logger.warning("Azure Speech key not configured, Azure TTS disabled")

        if not self.providers:
            logger.error("No TTS providers initialized! Service will not function.")
        else:
            logger.info(
                "TTS service initialized",
                provider_count=len(self.providers),
                primary_provider=self.primary_provider.name if self.primary_provider else None
            )

    async def synthesize(self, request: SynthesisRequest) -> SynthesisResponse:
        """
        Synthesize speech from text using available providers.

        Attempts primary provider first, falls back to secondary if needed.
        """
        if not self.providers:
            raise RuntimeError("No TTS providers available")

        logger.info(
            "Synthesis request",
            text_length=len(request.text),
            language=request.language,
            provider_count=len(self.providers)
        )

        # Try each provider in order
        last_error = None
        for provider in self.providers:
            try:
                if not provider.is_ready():
                    logger.warning(
                        "Provider not ready, skipping",
                        provider=provider.name
                    )
                    continue

                logger.info(
                    "Attempting synthesis with provider",
                    provider=provider.name
                )

                result = await provider.synthesize(request)

                logger.info(
                    "Synthesis successful",
                    provider=provider.name,
                    duration=result.duration_seconds,
                    processing_time_ms=result.processing_time_ms
                )

                return result

            except Exception as e:
                last_error = e
                logger.warning(
                    "Provider synthesis failed, trying next provider",
                    provider=provider.name,
                    error=str(e)
                )
                continue

        # All providers failed
        error_msg = f"All TTS providers failed. Last error: {str(last_error)}"
        logger.error("Synthesis failed with all providers", error=str(last_error))
        raise RuntimeError(error_msg)

    async def health_check(self) -> dict:
        """Check health of all providers."""
        provider_health = []

        for provider in self.providers:
            health = await provider.health_check()
            provider_health.append(health)

        return {
            "service": "tts-service",
            "status": "healthy" if self.providers else "unhealthy",
            "providers": provider_health,
            "primary_provider": self.primary_provider.name if self.primary_provider else None
        }

    async def cleanup(self) -> None:
        """Cleanup all provider resources."""
        for provider in self.providers:
            await provider.cleanup()

        logger.info("TTS service cleanup completed")


# Global TTS service instance
tts_service = TTSService()
