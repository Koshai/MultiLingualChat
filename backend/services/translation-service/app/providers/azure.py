"""Azure Translator provider implementation."""

import httpx
from typing import Dict, Any, List, Optional
import structlog

from app.providers.base import BaseTranslationProvider

logger = structlog.get_logger(__name__)


class AzureTranslatorProvider(BaseTranslationProvider):
    """Azure Translator API provider (free tier: 2M chars/month)."""

    def __init__(
        self,
        api_key: str,
        region: str = "global",
        endpoint: str = "https://api.cognitive.microsofttranslator.com"
    ):
        super().__init__("azure")
        self.api_key = api_key
        self.region = region
        self.endpoint = endpoint
        self.client: Optional[httpx.AsyncClient] = None

        # Azure Translator supported languages (major ones)
        self.supported_langs = [
            "en", "es", "fr", "de", "it", "pt", "ru", "zh-Hans", "ja", "ko",
            "ar", "hi", "tr", "pl", "nl", "sv", "da", "no", "fi", "cs", "el",
            "he", "id", "ms", "th", "vi", "uk", "ro", "hu", "ca", "bg"
        ]

    async def initialize(self) -> None:
        """Initialize Azure Translator client."""
        try:
            if not self.api_key or self.api_key == "":
                logger.warning("Azure Translator API key not configured")
                self.initialized = False
                return

            # Create HTTP client
            self.client = httpx.AsyncClient(timeout=30.0)

            # Test the API key with a simple translation
            test_result = await self._test_connection()

            if test_result:
                self.initialized = True
                logger.info(
                    "Azure Translator initialized",
                    region=self.region,
                    supported_languages=len(self.supported_langs)
                )
            else:
                self.initialized = False
                logger.warning("Azure Translator test failed - invalid API key?")

        except Exception as e:
            self.initialized = False
            logger.error("Failed to initialize Azure Translator", error=str(e))

    async def _test_connection(self) -> bool:
        """Test Azure Translator connection."""
        try:
            # Simple test translation using internal method (bypasses initialization check)
            await self._do_translate("test", "en", "es")
            return True
        except Exception as e:
            logger.error("Azure connection test failed", error=str(e), error_type=type(e).__name__)
            return False

    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """Translate text using Azure Translator API."""
        if not self.initialized or not self.client:
            raise RuntimeError("Azure Translator not initialized")

        return await self._do_translate(text, source_language, target_language)

    async def _do_translate(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """Internal translation method that bypasses initialization check."""
        try:
            # Azure uses different language codes (e.g., zh-Hans instead of zh)
            source_lang = self._normalize_language_code(source_language)
            target_lang = self._normalize_language_code(target_language)

            # Build request URL
            path = "/translate"
            url = f"{self.endpoint}{path}"

            params = {
                "api-version": "3.0",
                "from": source_lang,
                "to": target_lang
            }

            headers = {
                "Ocp-Apim-Subscription-Key": self.api_key,
                "Ocp-Apim-Subscription-Region": self.region,
                "Content-Type": "application/json"
            }

            body = [{"text": text}]

            # Make API request
            response = await self.client.post(
                url,
                params=params,
                headers=headers,
                json=body
            )

            response.raise_for_status()
            result = response.json()

            # Extract translated text
            if result and len(result) > 0 and "translations" in result[0]:
                translated_text = result[0]["translations"][0]["text"]
                confidence = result[0]["translations"][0].get("confidence", 1.0)

                return {
                    "translatedText": translated_text,
                    "confidence": confidence
                }
            else:
                raise ValueError("Invalid response from Azure Translator")

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.error("❌ Azure Translator authentication failed - check API key")
            elif e.response.status_code == 403:
                logger.error("❌ Azure Translator quota exceeded or access denied")
            else:
                logger.error(
                    "❌ Azure Translator HTTP error",
                    status_code=e.response.status_code,
                    error=str(e)
                )
            raise

        except Exception as e:
            logger.error("❌ Azure Translator error", error=str(e))
            raise

    def _normalize_language_code(self, lang_code: str) -> str:
        """Normalize language codes for Azure (e.g., zh -> zh-Hans)."""
        code_map = {
            "zh": "zh-Hans",  # Simplified Chinese
            "pt": "pt-br",    # Brazilian Portuguese
            "no": "nb"        # Norwegian Bokmål
        }
        return code_map.get(lang_code.lower(), lang_code.lower())

    async def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes."""
        return self.supported_langs

    async def health_check(self) -> Dict[str, Any]:
        """Check Azure Translator health."""
        if not self.initialized:
            return {
                "status": "unhealthy",
                "details": "Not initialized - check API key"
            }

        try:
            # Quick health check translation
            result = await self.translate("test", "en", "es")
            return {
                "status": "healthy",
                "details": "Azure Translator API responding"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Health check failed: {str(e)}"
            }

    async def cleanup(self) -> None:
        """Close HTTP client."""
        if self.client:
            await self.client.aclose()
            logger.info("Azure Translator client closed")
