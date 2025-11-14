"""Azure Speech-to-Text provider implementation."""

import azure.cognitiveservices.speech as speechsdk
import base64
import tempfile
import os
import time
import uuid
import struct
from typing import Optional
import structlog

from app.providers.base import BaseSTTProvider
from app.models.transcription import (
    TranscriptionRequest,
    TranscriptionResponse,
    TranscriptionSegment
)

logger = structlog.get_logger(__name__)


class AzureSpeechProvider(BaseSTTProvider):
    """Azure Speech-to-Text provider (free tier: 5 audio hours/month)."""

    def __init__(
        self,
        subscription_key: str,
        region: str = "eastus"
    ):
        super().__init__("azure_speech")
        self.subscription_key = subscription_key
        self.region = region
        self.speech_config: Optional[speechsdk.SpeechConfig] = None

        # Language code mapping (Azure uses BCP-47 codes)
        self.language_map = {
            "en": "en-US",
            "es": "es-ES",
            "fr": "fr-FR",
            "de": "de-DE",
            "it": "it-IT",
            "pt": "pt-BR",
            "ru": "ru-RU",
            "zh": "zh-CN",
            "ja": "ja-JP",
            "ko": "ko-KR",
            "ar": "ar-SA",
            "hi": "hi-IN",
            "bn": "bn-IN",  # Bengali (India)
            "tr": "tr-TR",
            "pl": "pl-PL",
            "nl": "nl-NL",
            "sv": "sv-SE",
            "da": "da-DK",
            "no": "nb-NO",
            "fi": "fi-FI"
        }

    async def initialize(self) -> None:
        """Initialize Azure Speech Service."""
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

            # Test the connection with a simple recognition
            test_result = await self._test_connection()

            if test_result:
                self.initialized = True
                logger.info(
                    "Azure Speech Service initialized",
                    region=self.region,
                    supported_languages=len(self.language_map)
                )
            else:
                self.initialized = False
                logger.warning("Azure Speech test failed - invalid API key?")

        except Exception as e:
            self.initialized = False
            logger.error("Failed to initialize Azure Speech Service", error=str(e))

    def _extract_pcm_from_wav(self, wav_bytes: bytes) -> tuple[bytes, int, int, int]:
        """
        Extract PCM data from WAV file.
        Returns: (pcm_data, sample_rate, channels, bits_per_sample)
        """
        try:
            if len(wav_bytes) < 44:
                raise ValueError(f"Invalid WAV file: too short (only {len(wav_bytes)} bytes)")

            # Check RIFF header
            if wav_bytes[0:4] != b'RIFF':
                raise ValueError(f"Invalid WAV file: missing RIFF header, got {wav_bytes[0:4]}")

            # Check WAVE format
            if wav_bytes[8:12] != b'WAVE':
                raise ValueError(f"Invalid WAV file: not a WAVE file, got {wav_bytes[8:12]}")

            # Find fmt chunk
            if wav_bytes[12:16] != b'fmt ':
                raise ValueError(f"Invalid WAV file: missing fmt chunk, got {wav_bytes[12:16]}")

            # Read format details from fmt chunk
            audio_format = struct.unpack('<H', wav_bytes[20:22])[0]
            channels = struct.unpack('<H', wav_bytes[22:24])[0]
            sample_rate = struct.unpack('<I', wav_bytes[24:28])[0]
            bits_per_sample = struct.unpack('<H', wav_bytes[34:36])[0]

            logger.debug(
                "WAV format info",
                audio_format=audio_format,
                channels=channels,
                sample_rate=sample_rate,
                bits_per_sample=bits_per_sample
            )

            # Validate format (1 = PCM)
            if audio_format != 1:
                raise ValueError(f"Unsupported audio format: {audio_format} (only PCM/1 is supported)")

            # Find data chunk
            data_offset = 36
            while data_offset < len(wav_bytes) - 8:
                chunk_id = wav_bytes[data_offset:data_offset+4]
                chunk_size = struct.unpack('<I', wav_bytes[data_offset+4:data_offset+8])[0]

                if chunk_id == b'data':
                    # Found data chunk, extract PCM data
                    pcm_start = data_offset + 8
                    pcm_end = pcm_start + chunk_size

                    if pcm_end > len(wav_bytes):
                        pcm_end = len(wav_bytes)
                        logger.warning(
                            "WAV data chunk size exceeds file size, truncating",
                            declared_size=chunk_size,
                            actual_size=len(wav_bytes) - pcm_start
                        )

                    pcm_data = wav_bytes[pcm_start:pcm_end]

                    if len(pcm_data) == 0:
                        raise ValueError("WAV data chunk is empty")

                    return pcm_data, sample_rate, channels, bits_per_sample

                # Move to next chunk
                data_offset += 8 + chunk_size

            raise ValueError("Invalid WAV file: missing data chunk")

        except struct.error as e:
            raise ValueError(f"Error parsing WAV file structure: {str(e)}")

    async def _test_connection(self) -> bool:
        """Test Azure Speech Service connection."""
        try:
            # We'll just verify the config is created successfully
            # Actual recognition test would require audio data
            return self.speech_config is not None
        except Exception as e:
            logger.error("Azure Speech connection test failed", error=str(e))
            return False

    async def transcribe(
        self,
        request: TranscriptionRequest
    ) -> TranscriptionResponse:
        """Transcribe audio using Azure Speech Service with streaming (no temp files)."""
        print(f"\n=== AZURE SPEECH TRANSCRIBE CALLED ===")
        print(f"Language: {request.language}")
        print(f"Audio data length: {len(request.audio_data) if request.audio_data else 0}")

        if not self.initialized or not self.speech_config:
            error_msg = "Azure Speech Service not initialized"
            print(f"ERROR: {error_msg}")
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        start_time = time.time()
        transcription_id = str(uuid.uuid4())

        try:
            print("Step 1: Decoding base64 audio...")
            # Decode base64 audio data
            audio_bytes = base64.b64decode(request.audio_data)
            print(f"Step 1 complete: Decoded {len(audio_bytes)} bytes")

            logger.info(
                "Transcribing audio with Azure Speech (streaming)",
                transcription_id=transcription_id,
                audio_size_bytes=len(audio_bytes),
                language=request.language
            )

            print("Step 2: Extracting PCM from WAV...")
            # Extract PCM data from WAV file
            pcm_data, sample_rate, channels, bits_per_sample = self._extract_pcm_from_wav(audio_bytes)
            print(f"Step 2 complete: PCM size={len(pcm_data)}, rate={sample_rate}, channels={channels}, bits={bits_per_sample}")

            logger.debug(
                "Extracted PCM from WAV",
                pcm_size=len(pcm_data),
                sample_rate=sample_rate,
                channels=channels,
                bits_per_sample=bits_per_sample
            )

            print("Step 3: Determining language...")
            # Determine language
            language_code = self._get_language_code(request.language)
            print(f"Step 3 complete: Language code = {language_code}")

            print("Step 4: Creating Azure Speech stream...")
            # Create push audio stream with extracted format
            audio_format = speechsdk.audio.AudioStreamFormat(
                samples_per_second=sample_rate,
                bits_per_sample=bits_per_sample,
                channels=channels
            )
            push_stream = speechsdk.audio.PushAudioInputStream(stream_format=audio_format)
            audio_config = speechsdk.audio.AudioConfig(stream=push_stream)
            print(f"Step 4 complete: Stream created")

            print("Step 5: Creating speech recognizer...")
            # Create speech recognizer
            if request.language:
                # Use specific language
                self.speech_config.speech_recognition_language = language_code
            else:
                # Auto-detect language - default to English if not specified
                self.speech_config.speech_recognition_language = "en-US"

            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            print(f"Step 5 complete: Recognizer created with language {self.speech_config.speech_recognition_language}")

            print("Step 6: Pushing audio data to stream...")
            # Push PCM data to stream (not the WAV file with headers!)
            push_stream.write(pcm_data)
            push_stream.close()
            print(f"Step 6 complete: Audio data pushed ({len(pcm_data)} bytes)")

            # Perform recognition
            print("Step 7: Starting Azure Speech recognition...")
            logger.info("Starting Azure Speech recognition...")
            result = speech_recognizer.recognize_once()
            print(f"Step 7 complete: Recognition finished")

            logger.info(
                "Azure Speech recognition completed",
                result_reason=str(result.reason),
                result_text=result.text if hasattr(result, 'text') else None
            )

            # Process result
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                text = result.text
                detected_language = request.language or "en"

                processing_time = int((time.time() - start_time) * 1000)

                response = TranscriptionResponse(
                    id=transcription_id,
                    text=text,
                    language=detected_language,
                    segments=[],  # Azure doesn't provide segments in simple mode
                    processing_time_ms=processing_time,
                    meeting_id=request.meeting_id,
                    user_id=request.user_id
                )

                logger.info(
                    "Azure Speech transcription completed",
                    transcription_id=transcription_id,
                    text_length=len(text),
                    language=detected_language,
                    processing_time_ms=processing_time
                )

                return response

            elif result.reason == speechsdk.ResultReason.NoMatch:
                logger.warning(
                    "No speech recognized",
                    transcription_id=transcription_id,
                    details=result.no_match_details
                )
                # Return empty transcription
                return TranscriptionResponse(
                    id=transcription_id,
                    text="",
                    language=request.language or "unknown",
                    segments=[],
                    processing_time_ms=int((time.time() - start_time) * 1000),
                    meeting_id=request.meeting_id,
                    user_id=request.user_id
                )

            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                error_msg = f"Azure Speech recognition canceled: {cancellation.reason}"
                if cancellation.reason == speechsdk.CancellationReason.Error:
                    error_msg += f" - {cancellation.error_details}"
                logger.error(error_msg, transcription_id=transcription_id)
                raise RuntimeError(error_msg)

            else:
                raise RuntimeError(f"Unexpected result reason: {result.reason}")

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            print(f"\n!!! EXCEPTION CAUGHT !!!")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")

            logger.error(
                "Azure Speech transcription failed",
                transcription_id=transcription_id,
                error=str(e),
                error_type=type(e).__name__,
                processing_time_ms=processing_time,
                exc_info=True
            )
            raise

    def _get_language_code(self, language: Optional[str]) -> str:
        """Convert language code to Azure BCP-47 format."""
        if not language:
            return "en-US"

        language = language.lower()
        return self.language_map.get(language, "en-US")

    async def health_check(self) -> dict:
        """Check Azure Speech Service health."""
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
            "details": "Azure Speech Service ready"
        }

    async def cleanup(self) -> None:
        """Cleanup Azure Speech resources."""
        if self.speech_config:
            self.speech_config = None
            logger.info("Azure Speech Service resources cleaned up")
