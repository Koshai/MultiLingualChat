from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
import structlog

from app.core.config import settings
from app.services.translation_service import TranslationService
from app.services.redis_service import RedisService
from app.api.routes import translation, health
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Translation Service")

    # Initialize Redis connection (optional)
    redis_service = RedisService()
    try:
        await redis_service.connect()
        logger.info("Redis connected successfully")
    except Exception as e:
        logger.warning("Redis connection failed - continuing without cache", error=str(e))
    app.state.redis = redis_service

    # Initialize Translation Service
    translation_service = TranslationService()
    await translation_service.initialize()
    app.state.translation_service = translation_service

    logger.info("Translation Service ready")

    yield

    # Shutdown
    logger.info("Shutting down Translation Service")
    await redis_service.disconnect()
    await translation_service.cleanup()
    logger.info("Translation Service shutdown complete")

app = FastAPI(
    title="Multilingual Chat - Translation Service",
    description="Real-time translation service using LibreTranslate",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(translation.router, prefix="/api/v1", tags=["translation"])

@app.get("/")
async def root():
    return {
        "service": "translation-service",
        "version": "1.0.0",
        "status": "healthy",
        "supported_languages": await app.state.translation_service.get_supported_languages()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )