"""Main STT service with provider pattern (Azure Speech primary, Whisper fallback)."""

import time
from typing import Optional
import structlog

from app.core.config import settings
from app.models.transcription import TranscriptionRequest, TranscriptionResponse
from app.providers.base import BaseSTTProvider
from app.providers.azure_speech import AzureSpeechProvider
from app.providers.whisper import WhisperProvider

logger = structlog.get_logger(__name__)


class STTService:
    """
    Main STT service with multi-provider support.
    Primary: Azure Speech (fast, cloud-based)
    Fallback: Whisper (local, offline)
    """

    def __init__(self):
        self.primary_provider: Optional[BaseSTTProvider] = None
        self.fallback_provider: Optional[BaseSTTProvider] = None
        self.providers: list[BaseSTTProvider] = []
        self.start_time = time.time()

    async def initialize(self):
        """Initialize STT providers with fallback chain."""
        try:
            await self._initialize_providers()

            if self.primary_provider:
                logger.info(
                    "STT Service initialized",
                    primary_provider=self.primary_provider.name,
                    fallback_provider=self.fallback_provider.name if self.fallback_provider else "none"
                )
            else:
                logger.error("No STT providers initialized successfully")
                raise RuntimeError("Failed to initialize any STT provider")

        except Exception as e:
            logger.error("Failed to initialize STT service", error=str(e))
            raise

    async def _initialize_providers(self) -> None:
        """Initialize STT providers with fallback chain."""

        # Initialize Azure Speech (primary if configured)
        if settings.AZURE_SPEECH_KEY and settings.AZURE_SPEECH_KEY != "":
            azure_provider = AzureSpeechProvider(
                subscription_key=settings.AZURE_SPEECH_KEY,
                region=settings.AZURE_SPEECH_REGION or "eastus"
            )
            await azure_provider.initialize()

            if azure_provider.initialized:
                self.primary_provider = azure_provider
                self.providers.append(azure_provider)
                logger.info("Azure Speech set as primary STT provider")

        # Initialize Whisper (fallback or primary if no Azure)
        try:
            whisper_provider = WhisperProvider(
                model_name=settings.WHISPER_MODEL,
                device=settings.DEVICE
            )
            await whisper_provider.initialize()

            if whisper_provider.initialized:
                if not self.primary_provider:
                    self.primary_provider = whisper_provider
                    logger.info("Whisper set as primary STT provider")
                else:
                    self.fallback_provider = whisper_provider
                    logger.info("Whisper set as fallback STT provider")

                self.providers.append(whisper_provider)

        except Exception as e:
            logger.warning("Failed to initialize Whisper provider", error=str(e))
            # Continue without Whisper if Azure is available
            if not self.primary_provider:
                raise

    async def transcribe(
        self,
        request: TranscriptionRequest
    ) -> TranscriptionResponse:
        """
        Transcribe audio using primary provider with fallback.

        Tries Azure Speech first (fast), falls back to Whisper if needed.
        """
        last_error = None

        # Try primary provider
        if self.primary_provider:
            try:
                logger.info(
                    "Using primary STT provider",
                    provider=self.primary_provider.name,
                    meeting_id=request.meeting_id
                )
                return await self.primary_provider.transcribe(request)

            except Exception as e:
                logger.warning(
                    "Primary STT provider failed, trying fallback",
                    provider=self.primary_provider.name,
                    error=str(e)
                )
                last_error = e

        # Try fallback provider
        if self.fallback_provider:
            try:
                logger.info(
                    "Using fallback STT provider",
                    provider=self.fallback_provider.name,
                    meeting_id=request.meeting_id
                )
                return await self.fallback_provider.transcribe(request)

            except Exception as e:
                logger.error(
                    "Fallback STT provider failed",
                    provider=self.fallback_provider.name,
                    error=str(e)
                )
                last_error = e

        # All providers failed
        error_msg = "All STT providers failed"
        if last_error:
            error_msg += f": {str(last_error)}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    async def get_health(self) -> dict:
        """Get service health status."""
        provider_health = []

        for provider in self.providers:
            try:
                health = await provider.health_check()
                provider_health.append(health)
            except Exception as e:
                provider_health.append({
                    "provider": provider.name,
                    "status": "error",
                    "error": str(e)
                })

        return {
            "status": "healthy" if self.primary_provider else "unhealthy",
            "uptime_seconds": time.time() - self.start_time,
            "providers": provider_health,
            "primary_provider": self.primary_provider.name if self.primary_provider else "none",
            "fallback_provider": self.fallback_provider.name if self.fallback_provider else "none"
        }

    async def cleanup(self):
        """Cleanup all provider resources."""
        for provider in self.providers:
            try:
                await provider.cleanup()
            except Exception as e:
                logger.warning(
                    "Failed to cleanup provider",
                    provider=provider.name,
                    error=str(e)
                )


# Global service instance
stt_service = STTService()
