"""Azure Text-to-Speech provider implementation."""

import azure.cognitiveservices.speech as speechsdk
import base64
import time
import uuid
from typing import Optional
import structlog

from app.providers.base import BaseTTSProvider
from app.models.synthesis import SynthesisRequest, SynthesisResponse

logger = structlog.get_logger(__name__)


class AzureTTSProvider(BaseTTSProvider):
    """Azure Text-to-Speech provider (free tier: 0.5M characters/month)."""

    def __init__(
        self,
        subscription_key: str,
        region: str = "eastus"
    ):
        super().__init__("azure_tts")
        self.subscription_key = subscription_key
        self.region = region
        self.speech_config: Optional[speechsdk.SpeechConfig] = None

        # Voice mapping for different languages
        # Using neural voices for better quality
        self.voice_map = {
            "en": "en-US-JennyNeural",      # Female, friendly
            "es": "es-ES-ElviraNeural",     # Female, friendly
            "fr": "fr-FR-DeniseNeural",     # Female, friendly
            "de": "de-DE-KatjaNeural",      # Female, friendly
            "it": "it-IT-ElsaNeural",       # Female, friendly
            "pt": "pt-BR-FranciscaNeural",  # Female, friendly
            "ru": "ru-RU-SvetlanaNeural",   # Female, friendly
            "zh": "zh-CN-XiaoxiaoNeural",   # Female, friendly
            "ja": "ja-JP-NanamiNeural",     # Female, friendly
            "ko": "ko-KR-SunHiNeural",      # Female, friendly
            "ar": "ar-SA-ZariyahNeural",    # Female, friendly
            "hi": "hi-IN-SwaraNeural",      # Female, friendly
            "bn": "bn-IN-TanishaaNeural",   # Bengali Female
            "tr": "tr-TR-EmelNeural",       # Female, friendly
            "pl": "pl-PL-ZofiaNeural",      # Female, friendly
            "nl": "nl-NL-ColetteNeural",    # Female, friendly
            "sv": "sv-SE-SofieNeural",      # Female, friendly
            "da": "da-DK-ChristelNeural",   # Female, friendly
            "no": "nb-NO-PernilleNeural",   # Female, friendly
            "fi": "fi-FI-NooraNeural",      # Female, friendly
        }

    async def initialize(self) -> None:
        """Initialize Azure TTS Service."""
        try:
            if not self.subscription_key or self.subscription_key == "":
                logger.warning("Azure Speech API key not configured")
                self.initialized = False
                return

            # Create speech configuration
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.subscription_key,
                region=self.region
            )

            # Set output format to MP3 for smaller size
            self.speech_config.set_speech_synthesis_output_format(
                speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
            )

            # Test connection (minimal test)
            if self.speech_config:
                self.initialized = True
                logger.info(
                    "Azure TTS Service initialized",
                    region=self.region,
                    supported_languages=len(self.voice_map)
                )
            else:
                self.initialized = False
                logger.warning("Azure TTS initialization failed")

        except Exception as e:
            self.initialized = False
            logger.error("Failed to initialize Azure TTS Service", error=str(e))

    async def synthesize(self, request: SynthesisRequest) -> SynthesisResponse:
        """Synthesize speech using Azure TTS."""
        if not self.initialized or not self.speech_config:
            raise RuntimeError("Azure TTS Service not initialized")

        start_time = time.time()
        synthesis_id = str(uuid.uuid4())

        try:
            logger.info(
                "Synthesizing speech with Azure TTS",
                synthesis_id=synthesis_id,
                text_length=len(request.text),
                language=request.language,
                speed=request.speed,
                pitch=request.pitch
            )

            # Select voice based on language
            voice_name = request.voice or self._get_voice_name(request.language)
            self.speech_config.speech_synthesis_voice_name = voice_name

            # Create synthesizer
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=None  # None = in-memory result
            )

            # Build SSML for better control over prosody
            ssml = self._build_ssml(
                text=request.text,
                voice_name=voice_name,
                speed=request.speed,
                pitch=request.pitch
            )

            logger.debug("Synthesizing with SSML", ssml=ssml)

            # Perform synthesis
            result = synthesizer.speak_ssml_async(ssml).get()

            # Process result
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                audio_data = result.audio_data
                base64_audio = base64.b64encode(audio_data).decode('utf-8')

                # Estimate duration (MP3 at 32kbps = ~4KB/sec)
                duration_seconds = len(audio_data) / 4000.0

                processing_time = int((time.time() - start_time) * 1000)

                response = SynthesisResponse(
                    id=synthesis_id,
                    audio_data=base64_audio,
                    format="mp3",
                    language=request.language,
                    duration_seconds=duration_seconds,
                    provider=self.name,
                    processing_time_ms=processing_time,
                    meeting_id=request.meeting_id,
                    user_id=request.user_id,
                    transcription_id=request.transcription_id
                )

                logger.info(
                    "Azure TTS synthesis completed",
                    synthesis_id=synthesis_id,
                    audio_size_bytes=len(audio_data),
                    duration_seconds=duration_seconds,
                    processing_time_ms=processing_time
                )

                return response

            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                error_msg = f"Azure TTS synthesis canceled: {cancellation.reason}"
                if cancellation.reason == speechsdk.CancellationReason.Error:
                    error_msg += f" - {cancellation.error_details}"
                logger.error(error_msg, synthesis_id=synthesis_id)
                raise RuntimeError(error_msg)

            else:
                raise RuntimeError(f"Unexpected result reason: {result.reason}")

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(
                "Azure TTS synthesis failed",
                synthesis_id=synthesis_id,
                error=str(e),
                processing_time_ms=processing_time,
                exc_info=True
            )
            raise

    def _get_voice_name(self, language: str) -> str:
        """Get Azure voice name for language."""
        language = language.lower()
        return self.voice_map.get(language, "en-US-JennyNeural")

    def _build_ssml(
        self,
        text: str,
        voice_name: str,
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> str:
        """
        Build SSML (Speech Synthesis Markup Language) for Azure TTS.

        Allows control over prosody (speed, pitch, volume).
        """
        # Convert speed to percentage (1.0 = 100%, 1.5 = 150%)
        speed_percent = f"{int(speed * 100)}%"

        # Convert pitch to relative value (1.0 = +0%, 1.2 = +20%)
        pitch_percent = f"+{int((pitch - 1.0) * 100)}%" if pitch >= 1.0 else f"{int((pitch - 1.0) * 100)}%"

        # Escape XML special characters in text
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        ssml = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="{voice_name}">
                <prosody rate="{speed_percent}" pitch="{pitch_percent}">
                    {text}
                </prosody>
            </voice>
        </speak>
        """.strip()

        return ssml

    async def health_check(self) -> dict:
        """Check Azure TTS Service health."""
        if not self.initialized:
            return {
                "status": "unhealthy",
                "provider": self.name,
                "details": "Not initialized - check API key"
            }

        return {
            "status": "healthy",
            "provider": self.name,
            "region": self.region,
            "details": "Azure TTS Service ready"
        }

    async def cleanup(self) -> None:
        """Cleanup Azure TTS resources."""
        if self.speech_config:
            self.speech_config = None
            logger.info("Azure TTS Service resources cleaned up")
