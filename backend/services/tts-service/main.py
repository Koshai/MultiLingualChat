"""TTS Service - Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.core.config import settings
from app.core.logging import configure_logging
from app.services.tts_service import tts_service
from app.api.routes import health, synthesis

# Configure logging
configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting TTS service...")
    await tts_service.initialize()
    logger.info("TTS service started successfully")

    yield

    # Shutdown
    logger.info("Shutting down TTS service...")
    await tts_service.cleanup()
    logger.info("TTS service shut down successfully")


# Create FastAPI app
app = FastAPI(
    title="TTS Service",
    description="Text-to-Speech service with multi-provider support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(
    synthesis.router,
    prefix="/api/v1/synthesis",
    tags=["synthesis"]
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.tts_service_host,
        port=settings.tts_service_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
