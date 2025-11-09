"""Argos Translate provider implementation (local, offline, free)."""

import asyncio
from typing import Dict, Any, List
import structlog
import argostranslate.translate
import argostranslate.package

from app.providers.base import BaseTranslationProvider

logger = structlog.get_logger(__name__)


class ArgosTranslateProvider(BaseTranslationProvider):
    """Argos Translate provider (100% free, offline, lower quality)."""

    def __init__(self):
        super().__init__("argos")
        self.installed_packages = []
        self.supported_pairs = {}

    async def initialize(self) -> None:
        """Initialize Argos Translate."""
        try:
            # Load installed packages
            self.installed_packages = argostranslate.package.get_installed_packages()

            # Build supported language pairs
            for package in self.installed_packages:
                pair_key = f"{package.from_code}->{package.to_code}"
                self.supported_pairs[pair_key] = package

            self.initialized = True
            logger.info(
                "✅ Argos Translate initialized",
                installed_packages=len(self.installed_packages),
                language_pairs=len(self.supported_pairs)
            )

        except Exception as e:
            self.initialized = False
            logger.error("❌ Failed to initialize Argos Translate", error=str(e))
            raise

    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """Translate text using Argos Translate."""
        if not self.initialized:
            raise RuntimeError("Argos Translate not initialized")

        try:
            # Check if direct translation path exists
            pair_key = f"{source_language}->{target_language}"

            if pair_key not in self.supported_pairs:
                # Try indirect translation through English
                logger.debug(
                    f"Direct pair {pair_key} not available, trying via English",
                    source=source_language,
                    target=target_language
                )
                return await self._translate_via_english(text, source_language, target_language)

            # Use Argos Translate in executor (to avoid blocking event loop)
            loop = asyncio.get_event_loop()
            translated_text = await loop.run_in_executor(
                None,
                argostranslate.translate.translate,
                text,
                source_language,
                target_language
            )

            return {
                "translatedText": translated_text,
                "confidence": 0.8  # Argos doesn't provide confidence, use default
            }

        except Exception as e:
            logger.error(
                "❌ Argos Translate failed",
                error=str(e),
                source=source_language,
                target=target_language
            )
            raise

    async def _translate_via_english(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """Translate via English as intermediate language."""
        try:
            # Check if we have source->en and en->target
            to_en_key = f"{source_language}->en"
            from_en_key = f"en->{target_language}"

            if to_en_key not in self.supported_pairs:
                raise ValueError(f"Translation path {source_language}->en not available")

            if from_en_key not in self.supported_pairs:
                raise ValueError(f"Translation path en->{target_language} not available")

            # First translate to English
            loop = asyncio.get_event_loop()
            english_text = await loop.run_in_executor(
                None,
                argostranslate.translate.translate,
                text,
                source_language,
                "en"
            )

            # Then translate from English to target
            translated_text = await loop.run_in_executor(
                None,
                argostranslate.translate.translate,
                english_text,
                "en",
                target_language
            )

            return {
                "translatedText": translated_text,
                "confidence": 0.7  # Lower confidence for indirect translation
            }

        except Exception as e:
            logger.error(
                "❌ Argos indirect translation failed",
                error=str(e),
                source=source_language,
                target=target_language
            )
            raise

    async def get_supported_languages(self) -> List[str]:
        """Get list of supported language codes."""
        # Extract unique language codes from installed packages
        languages = set()
        for package in self.installed_packages:
            languages.add(package.from_code)
            languages.add(package.to_code)
        return sorted(list(languages))

    async def health_check(self) -> Dict[str, Any]:
        """Check Argos Translate health."""
        if not self.initialized:
            return {
                "status": "unhealthy",
                "details": "Not initialized"
            }

        try:
            # Quick test translation
            result = await self.translate("test", "en", "es")
            return {
                "status": "healthy",
                "details": f"Argos Translate working ({len(self.installed_packages)} packages)"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Health check failed: {str(e)}"
            }
