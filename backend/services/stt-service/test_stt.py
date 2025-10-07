"""
Simple test script for STT service.
Tests the /transcribe endpoint with a sample audio file.
"""
import requests
import base64
import json
from pathlib import Path


def create_test_audio():
    """Create a simple test WAV file with silence."""
    import wave
    import numpy as np

    # Create 2 seconds of silence (16kHz, mono)
    sample_rate = 16000
    duration = 2
    samples = np.zeros(sample_rate * duration, dtype=np.int16)

    # Save as WAV
    test_file = Path("test_audio.wav")
    with wave.open(str(test_file), 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(samples.tobytes())

    return test_file


def test_transcription():
    """Test the STT service transcription endpoint."""
    print("Testing STT Service...")
    print("=" * 50)

    # Create test audio file
    print("\n1. Creating test audio file...")
    test_file = create_test_audio()
    print(f"   OK Created: {test_file}")

    # Read and encode audio
    print("\n2. Reading and encoding audio...")
    with open(test_file, 'rb') as f:
        audio_bytes = f.read()

    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    print(f"   OK Encoded {len(audio_bytes)} bytes")

    # Prepare request
    print("\n3. Sending transcription request...")
    url = "http://localhost:3004/api/v1/transcription/transcribe"

    payload = {
        "audio_data": audio_base64,
        "language": "en",
        "meeting_id": "test-meeting",
        "user_id": "test-user"
    }

    try:
        response = requests.post(url, json=payload, timeout=30)

        print(f"\n4. Response received:")
        print(f"   Status Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("\n   Success! Transcription completed")
            print(f"   Text: '{result['text']}'")
            print(f"   Language: {result['language']}")
            print(f"   Processing time: {result['processing_time_ms']}ms")
            print(f"   Segments: {len(result.get('segments', []))}")

            print("\n   Full Response:")
            print(json.dumps(result, indent=2))

        else:
            print(f"\n   Error: {response.status_code}")
            print(f"   Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("\n   Error: Could not connect to STT service")
        print("   Make sure the service is running on http://localhost:3004")
    except Exception as e:
        print(f"\n   Error: {str(e)}")

    # Cleanup
    print("\n5. Cleaning up...")
    test_file.unlink()
    print("   Test file removed")

    print("\n" + "=" * 50)
    print("Test complete!")


def test_health():
    """Test the health endpoint."""
    print("\nTesting Health Endpoint...")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:3004/health", timeout=5)

        if response.status_code == 200:
            health = response.json()
            print("\nService is healthy!")
            print(f"   Status: {health['status']}")
            print(f"   Model: {health['model']}")
            print(f"   Device: {health['device']}")
            print(f"   Uptime: {health['uptime_seconds']:.2f}s")
        else:
            print(f"\nHealth check failed: {response.status_code}")

    except Exception as e:
        print(f"\nError: {str(e)}")

    print("=" * 50)


if __name__ == "__main__":
    print("\nSTT Service Test Suite")
    print("=" * 50)

    # Test health first
    test_health()

    # Test transcription
    test_transcription()

    print("\nAll tests completed!\n")
