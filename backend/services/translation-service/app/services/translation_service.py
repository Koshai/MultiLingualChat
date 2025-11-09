import httpx
import asyncio
import time
import uuid
from typing import List, Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog

from app.core.config import settings
from app.models.translation import (
    TranslationRequest,
    TranslationResponse,
    TranslationStatus,
    SupportedLanguage,
    BatchTranslationRequest,
    BatchTranslationResponse
)
from app.services.redis_service import RedisService
from app.providers import AzureTranslatorProvider, ArgosTranslateProvider, BaseTranslationProvider

logger = structlog.get_logger(__name__)

class TranslationService:
    def __init__(self):
        self.redis_service = RedisService()
        self.supported_languages: List[SupportedLanguage] = []
        self.start_time = time.time()

        # Multi-provider setup with fallback
        self.primary_provider: Optional[BaseTranslationProvider] = None
        self.fallback_provider: Optional[BaseTranslationProvider] = None
        self.providers: List[BaseTranslationProvider] = []

    async def initialize(self) -> None:
        """Initialize the translation service with providers."""
        try:
            # Connect to Redis (optional - service works without it)
            try:
                await self.redis_service.connect()
                logger.info("✅ Redis connected for caching")
            except Exception as redis_error:
                logger.warning(
                    "⚠️ Redis connection failed - caching disabled",
                    error=str(redis_error)
                )

            # Initialize providers based on configuration
            await self._initialize_providers()

            # Load supported languages
            await self._load_supported_languages()

            provider_names = [p.name for p in self.providers if p.initialized]
            logger.info(
                "🌐 Translation service initialized",
                providers=provider_names,
                primary=self.primary_provider.name if self.primary_provider else None,
                supported_languages=len(self.supported_languages)
            )

        except Exception as e:
            logger.error("❌ Failed to initialize translation service", error=str(e))
            raise

    async def _initialize_providers(self) -> None:
        """Initialize translation providers with fallback chain."""

        # Initialize Azure Translator (primary if configured)
        if settings.AZURE_TRANSLATOR_KEY and settings.AZURE_TRANSLATOR_KEY != "":
            azure_provider = AzureTranslatorProvider(
                api_key=settings.AZURE_TRANSLATOR_KEY,
                region=settings.AZURE_TRANSLATOR_REGION or "global"
            )
            await azure_provider.initialize()

            if azure_provider.initialized:
                self.primary_provider = azure_provider
                self.providers.append(azure_provider)
                logger.info("✅ Azure Translator set as primary provider")

        # Initialize Argos Translate (fallback or primary if no Azure)
        try:
            argos_provider = ArgosTranslateProvider()
            await argos_provider.initialize()

            if argos_provider.initialized:
                if not self.primary_provider:
                    # Use Argos as primary if no other provider available
                    self.primary_provider = argos_provider
                    logger.info("✅ Argos Translate set as primary provider")
                else:
                    # Use Argos as fallback
                    self.fallback_provider = argos_provider
                    logger.info("✅ Argos Translate set as fallback provider")

                self.providers.append(argos_provider)
        except Exception as e:
            logger.warning("⚠️ Argos Translate initialization failed", error=str(e))

        if not self.providers:
            raise RuntimeError("No translation providers available")

    async def cleanup(self) -> None:
        """Cleanup resources."""
        # Cleanup all providers
        for provider in self.providers:
            try:
                await provider.cleanup()
            except Exception as e:
                logger.warning(f"Error cleaning up {provider.name}", error=str(e))

        # Disconnect Redis
        await self.redis_service.disconnect()

    async def _make_translation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make translation request using provider chain with fallback."""
        source_lang = data["source"]
        target_lang = data["target"]
        text = data["q"]

        # Try primary provider first
        if self.primary_provider and self.primary_provider.initialized:
            try:
                result = await self.primary_provider.translate(text, source_lang, target_lang)
                logger.debug(
                    f"✅ Translation via {self.primary_provider.name}",
                    provider=self.primary_provider.name
                )
                return result
            except Exception as e:
                logger.warning(
                    f"⚠️ Primary provider ({self.primary_provider.name}) failed, trying fallback",
                    error=str(e)
                )

                # Try fallback provider
                if self.fallback_provider and self.fallback_provider.initialized:
                    try:
                        result = await self.fallback_provider.translate(text, source_lang, target_lang)
                        logger.info(
                            f"✅ Translation via fallback ({self.fallback_provider.name})",
                            provider=self.fallback_provider.name
                        )
                        return result
                    except Exception as fallback_error:
                        logger.error(
                            "❌ Fallback provider also failed",
                            error=str(fallback_error)
                        )
                        raise
                else:
                    raise  # No fallback available, re-raise primary error

        # Should not reach here if providers are initialized
        raise RuntimeError("No translation provider available")

    async def _load_supported_languages(self) -> None:
        """Load supported languages from all providers."""
        # Combine languages from all providers
        all_languages = set()

        for provider in self.providers:
            if provider.initialized:
                provider_langs = await provider.get_supported_languages()
                all_languages.update(provider_langs)

        # Convert to SupportedLanguage objects
        self.supported_languages = [
            SupportedLanguage(code=code, name=code.upper())
            for code in sorted(all_languages)
        ]

        logger.info(
            "📋 Loaded supported languages",
            count=len(self.supported_languages),
            languages=[lang.code for lang in self.supported_languages]
        )

    async def get_supported_languages(self) -> List[SupportedLanguage]:
        """Get list of supported languages."""
        return self.supported_languages

    async def translate_text(
        self,
        request: TranslationRequest,
        user_id: Optional[str] = None
    ) -> TranslationResponse:
        """Translate text from source to target language."""
        start_time = time.time()
        translation_id = str(uuid.uuid4())

        try:
            # Check rate limiting
            if user_id and not await self.redis_service.check_rate_limit(user_id):
                raise ValueError("Rate limit exceeded")

            # Check cache first
            cached_result = await self.redis_service.get_cached_translation(
                request.text,
                request.source_language,
                request.target_language
            )

            if cached_result:
                processing_time = int((time.time() - start_time) * 1000)
                await self.redis_service.increment_stats(
                    cache_hit=True,
                    source_lang=request.source_language,
                    target_lang=request.target_language
                )

                return TranslationResponse(
                    id=translation_id,
                    text=request.text,
                    translated_text=cached_result["translated_text"],
                    source_language=request.source_language,
                    target_language=request.target_language,
                    confidence=cached_result.get("confidence"),
                    status=TranslationStatus.CACHED,
                    cached=True,
                    processing_time_ms=processing_time,
                    message_id=request.message_id
                )

            # Skip translation if source and target are the same
            if request.source_language == request.target_language:
                processing_time = int((time.time() - start_time) * 1000)
                return TranslationResponse(
                    id=translation_id,
                    text=request.text,
                    translated_text=request.text,
                    source_language=request.source_language,
                    target_language=request.target_language,
                    confidence=1.0,
                    status=TranslationStatus.COMPLETED,
                    cached=False,
                    processing_time_ms=processing_time,
                    message_id=request.message_id
                )

            # Make translation request
            translation_data = {
                "q": request.text,
                "source": request.source_language,
                "target": request.target_language,
                "format": "text"
            }

            result = await self._make_translation_request(translation_data)
            translated_text = result["translatedText"]

            processing_time = int((time.time() - start_time) * 1000)

            # Cache the result
            await self.redis_service.cache_translation(
                request.text,
                request.source_language,
                request.target_language,
                translated_text,
                processing_time_ms=processing_time
            )

            # Update statistics
            await self.redis_service.increment_stats(
                cache_hit=False,
                processing_time_ms=processing_time,
                source_lang=request.source_language,
                target_lang=request.target_language
            )

            logger.info(
                "✅ Translation completed",
                source_lang=request.source_language,
                target_lang=request.target_language,
                processing_time_ms=processing_time,
                text_length=len(request.text),
                translation_id=translation_id
            )

            return TranslationResponse(
                id=translation_id,
                text=request.text,
                translated_text=translated_text,
                source_language=request.source_language,
                target_language=request.target_language,
                confidence=result.get("confidence"),
                status=TranslationStatus.COMPLETED,
                cached=False,
                processing_time_ms=processing_time,
                message_id=request.message_id
            )

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)

            # Update error statistics
            await self.redis_service.increment_stats(
                error=True,
                source_lang=request.source_language,
                target_lang=request.target_language
            )

            logger.error(
                "❌ Translation failed",
                error=str(e),
                source_lang=request.source_language,
                target_lang=request.target_language,
                processing_time_ms=processing_time,
                translation_id=translation_id
            )

            return TranslationResponse(
                id=translation_id,
                text=request.text,
                translated_text="",
                source_language=request.source_language,
                target_language=request.target_language,
                status=TranslationStatus.FAILED,
                cached=False,
                processing_time_ms=processing_time,
                message_id=request.message_id
            )

    async def translate_batch(
        self,
        batch_request: BatchTranslationRequest,
        user_id: Optional[str] = None
    ) -> BatchTranslationResponse:
        """Translate multiple texts in batch."""
        start_time = time.time()
        batch_id = str(uuid.uuid4())

        try:
            # Process translations concurrently
            tasks = [
                self.translate_text(req, user_id)
                for req in batch_request.requests
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            translations = []
            completed = 0
            failed = 0

            for result in results:
                if isinstance(result, Exception):
                    failed += 1
                    # Create error response
                    error_response = TranslationResponse(
                        id=str(uuid.uuid4()),
                        text="",
                        translated_text="",
                        source_language="",
                        target_language="",
                        status=TranslationStatus.FAILED,
                        cached=False
                    )
                    translations.append(error_response)
                else:
                    translations.append(result)
                    if result.status == TranslationStatus.COMPLETED or result.status == TranslationStatus.CACHED:
                        completed += 1
                    else:
                        failed += 1

            total_processing_time = int((time.time() - start_time) * 1000)

            batch_response = BatchTranslationResponse(
                batch_id=batch_id,
                total_requests=len(batch_request.requests),
                completed=completed,
                failed=failed,
                translations=translations,
                total_processing_time_ms=total_processing_time
            )

            # Store batch result for later retrieval
            await self.redis_service.store_batch_result(
                batch_id,
                batch_response.dict()
            )

            logger.info(
                "📦 Batch translation completed",
                batch_id=batch_id,
                total_requests=len(batch_request.requests),
                completed=completed,
                failed=failed,
                total_processing_time_ms=total_processing_time
            )

            return batch_response

        except Exception as e:
            logger.error("❌ Batch translation failed", error=str(e), batch_id=batch_id)
            raise

    async def get_translation_stats(self) -> Dict[str, Any]:
        """Get translation service statistics."""
        stats = await self.redis_service.get_stats()
        stats["uptime_seconds"] = time.time() - self.start_time
        stats["supported_languages"] = len(self.supported_languages)
        return stats

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all providers."""
        try:
            # Check all providers
            provider_statuses = {}
            for provider in self.providers:
                health = await provider.health_check()
                provider_statuses[provider.name] = health["status"]

            # Check Redis (optional)
            redis_status = "healthy" if self.redis_service.connected else "disconnected"

            # Determine overall status
            if self.primary_provider and self.primary_provider.initialized:
                primary_health = provider_statuses.get(self.primary_provider.name)
                if primary_health == "healthy":
                    overall_status = "healthy"
                elif self.fallback_provider and self.fallback_provider.initialized:
                    overall_status = "degraded"  # Primary down but fallback available
                else:
                    overall_status = "unhealthy"
            elif self.fallback_provider and self.fallback_provider.initialized:
                overall_status = "degraded"  # Only fallback available
            else:
                overall_status = "unhealthy"

            return {
                "status": overall_status,
                "providers": {
                    "primary": self.primary_provider.name if self.primary_provider else None,
                    "fallback": self.fallback_provider.name if self.fallback_provider else None,
                    "statuses": provider_statuses
                },
                "dependencies": {
                    "redis": redis_status
                },
                "uptime_seconds": time.time() - self.start_time,
                "supported_languages": len(self.supported_languages)
            }

        except Exception as e:
            logger.error("❌ Health check failed", error=str(e))
            return {
                "status": "unhealthy",
                "error": str(e),
                "uptime_seconds": time.time() - self.start_time
            }