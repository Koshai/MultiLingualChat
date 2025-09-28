from fastapi import Depends, HTTPException, status
from redis.asyncio import Redis
import httpx
from typing import Optional

from .config import settings

async def get_redis_client() -> Redis:
    """Get Redis client dependency."""
    try:
        client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.ping()
        return client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis connection failed: {str(e)}"
        )

async def get_translation_client() -> httpx.AsyncClient:
    """Get HTTP client for LibreTranslate."""
    return httpx.AsyncClient(
        base_url=settings.LIBRETRANSLATE_URL,
        timeout=settings.TRANSLATION_TIMEOUT
    )

async def validate_language(language: str) -> str:
    """Validate language code."""
    if language not in settings.SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language: {language}. Supported: {', '.join(settings.SUPPORTED_LANGUAGES)}"
        )
    return language

async def validate_text_length(text: str) -> str:
    """Validate text length."""
    if len(text) > settings.MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text too long. Maximum length: {settings.MAX_TEXT_LENGTH} characters"
        )
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    return text.strip()