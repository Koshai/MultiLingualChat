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

logger = structlog.get_logger(__name__)

class TranslationService:
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.redis_service = RedisService()
        self.supported_languages: List[SupportedLanguage] = []
        self.start_time = time.time()

    async def initialize(self) -> None:
        """Initialize the translation service."""
        try:
            # Initialize HTTP client
            self.client = httpx.AsyncClient(
                base_url=settings.LIBRETRANSLATE_URL,
                timeout=settings.TRANSLATION_TIMEOUT,
                headers={
                    "Content-Type": "application/json"
                }
            )

            # Connect to Redis
            await self.redis_service.connect()

            # Load supported languages
            await self._load_supported_languages()

            logger.info(
                "🌐 Translation service initialized",
                libretranslate_url=settings.LIBRETRANSLATE_URL,
                supported_languages=len(self.supported_languages)
            )

        except Exception as e:
            logger.error("❌ Failed to initialize translation service", error=str(e))
            raise

    async def cleanup(self) -> None:
        """Cleanup resources."""
        if self.client:
            await self.client.aclose()
        await self.redis_service.disconnect()

    @retry(
        stop=stop_after_attempt(settings.RETRY_ATTEMPTS),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def _make_translation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make translation request to LibreTranslate with retry logic."""
        if not self.client:
            raise RuntimeError("Translation client not initialized")

        headers = {}
        if settings.LIBRETRANSLATE_API_KEY:
            headers["Authorization"] = f"Bearer {settings.LIBRETRANSLATE_API_KEY}"

        response = await self.client.post(
            "/translate",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        return response.json()

    async def _load_supported_languages(self) -> None:
        """Load supported languages from LibreTranslate."""
        try:
            if not self.client:
                raise RuntimeError("HTTP client not initialized")

            response = await self.client.get("/languages")
            response.raise_for_status()
            languages_data = response.json()

            self.supported_languages = [
                SupportedLanguage(code=lang["code"], name=lang["name"])
                for lang in languages_data
                if lang["code"] in settings.SUPPORTED_LANGUAGES
            ]

            logger.info(
                "📋 Loaded supported languages",
                count=len(self.supported_languages),
                languages=[lang.code for lang in self.supported_languages]
            )

        except Exception as e:
            logger.warning("⚠️ Failed to load languages from LibreTranslate", error=str(e))
            # Fallback to configured languages
            self.supported_languages = [
                SupportedLanguage(code=code, name=code.upper())
                for code in settings.SUPPORTED_LANGUAGES
            ]

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
        """Perform health check."""
        try:
            # Check LibreTranslate
            if self.client:
                response = await self.client.get("/", timeout=5)
                libretranslate_status = "healthy" if response.status_code == 200 else "unhealthy"
            else:
                libretranslate_status = "not_initialized"

            # Check Redis
            redis_status = "healthy" if self.redis_service.connected else "unhealthy"

            overall_status = "healthy" if all([
                libretranslate_status == "healthy",
                redis_status == "healthy"
            ]) else "unhealthy"

            return {
                "status": overall_status,
                "dependencies": {
                    "libretranslate": libretranslate_status,
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
                "dependencies": {
                    "libretranslate": "unknown",
                    "redis": "unknown"
                },
                "uptime_seconds": time.time() - self.start_time
            }