from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from typing import Optional, List
import structlog

from app.models.translation import (
    TranslationRequest,
    TranslationResponse,
    BatchTranslationRequest,
    BatchTranslationResponse,
    TranslationStats,
    SupportedLanguage
)
from app.core.dependencies import validate_language, validate_text_length
from app.services.translation_service import TranslationService

logger = structlog.get_logger(__name__)
router = APIRouter()

async def get_translation_service() -> TranslationService:
    """Dependency to get translation service from app state."""
    from main import app
    return app.state.translation_service

@router.get("/languages", response_model=List[SupportedLanguage])
async def get_supported_languages(
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Get list of supported languages."""
    try:
        languages = await translation_service.get_supported_languages()
        return languages
    except Exception as e:
        logger.error("❌ Failed to get supported languages", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve supported languages")

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    user_id: Optional[str] = Query(None, description="User ID for rate limiting"),
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Translate text from source to target language."""
    try:
        # Validate languages
        await validate_language(request.source_language)
        await validate_language(request.target_language)

        # Validate text
        await validate_text_length(request.text)

        # Perform translation
        result = await translation_service.translate_text(request, user_id)

        logger.info(
            "🔄 Translation request processed",
            source_lang=request.source_language,
            target_lang=request.target_language,
            status=result.status,
            cached=result.cached,
            user_id=user_id
        )

        return result

    except ValueError as e:
        logger.warning("⚠️ Translation validation error", error=str(e), user_id=user_id)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("❌ Translation request failed", error=str(e), user_id=user_id)
        raise HTTPException(status_code=500, detail="Translation service unavailable")

@router.post("/translate/batch", response_model=BatchTranslationResponse)
async def translate_batch(
    batch_request: BatchTranslationRequest,
    user_id: Optional[str] = Query(None, description="User ID for rate limiting"),
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Translate multiple texts in batch."""
    try:
        # Validate all requests
        for req in batch_request.requests:
            await validate_language(req.source_language)
            await validate_language(req.target_language)
            await validate_text_length(req.text)

        # Process batch
        result = await translation_service.translate_batch(batch_request, user_id)

        logger.info(
            "📦 Batch translation completed",
            batch_id=result.batch_id,
            total_requests=result.total_requests,
            completed=result.completed,
            failed=result.failed,
            user_id=user_id
        )

        return result

    except ValueError as e:
        logger.warning("⚠️ Batch validation error", error=str(e), user_id=user_id)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("❌ Batch translation failed", error=str(e), user_id=user_id)
        raise HTTPException(status_code=500, detail="Batch translation service unavailable")

@router.get("/translate/batch/{batch_id}", response_model=BatchTranslationResponse)
async def get_batch_result(
    batch_id: str,
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Get batch translation result by ID."""
    try:
        from main import app
        redis_service = app.state.translation_service.redis_service
        result = await redis_service.get_batch_result(batch_id)

        if not result:
            raise HTTPException(status_code=404, detail="Batch result not found")

        return BatchTranslationResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ Failed to get batch result", error=str(e), batch_id=batch_id)
        raise HTTPException(status_code=500, detail="Failed to retrieve batch result")

@router.get("/stats", response_model=TranslationStats)
async def get_translation_stats(
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Get translation service statistics."""
    try:
        stats = await translation_service.get_translation_stats()
        return TranslationStats(**stats)
    except Exception as e:
        logger.error("❌ Failed to get translation stats", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

@router.post("/translate/message")
async def translate_message(
    message_id: str,
    target_language: str,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Query(None),
    translation_service: TranslationService = Depends(get_translation_service)
):
    """
    Translate a specific message for real-time chat.
    This endpoint is optimized for WebSocket integration.
    """
    try:
        # Validate target language
        await validate_language(target_language)

        # This would typically fetch the message from the chat service
        # For now, we'll return a success response
        # In a real implementation, this would:
        # 1. Fetch message content from chat service
        # 2. Translate the content
        # 3. Send result back via WebSocket or callback

        logger.info(
            "💬 Message translation requested",
            message_id=message_id,
            target_language=target_language,
            user_id=user_id
        )

        return {
            "success": True,
            "message": "Translation request queued",
            "message_id": message_id,
            "target_language": target_language
        }

    except ValueError as e:
        logger.warning("⚠️ Message translation validation error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("❌ Message translation failed", error=str(e))
        raise HTTPException(status_code=500, detail="Message translation service unavailable")

@router.delete("/cache")
async def clear_translation_cache():
    """Clear translation cache (admin endpoint)."""
    try:
        # This would clear the Redis cache
        # Implementation depends on your Redis service
        logger.info("🗑️ Translation cache clear requested")

        return {
            "success": True,
            "message": "Cache clear requested"
        }
    except Exception as e:
        logger.error("❌ Failed to clear cache", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to clear cache")