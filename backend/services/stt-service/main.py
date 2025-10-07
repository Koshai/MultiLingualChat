from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import transcription, health
from app.services.whisper_service import whisper_service

# Setup logging
setup_logging()

# Create FastAPI application
app = FastAPI(
    title="Speech-to-Text Service",
    description="Real-time speech transcription using OpenAI Whisper",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(
    transcription.router,
    prefix="/api/v1/transcription",
    tags=["Transcription"]
)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    print(f"Starting {settings.SERVICE_NAME}")
    print(f"Running on http://{settings.HOST}:{settings.PORT}")
    await whisper_service.initialize()
    print(f"{settings.SERVICE_NAME} ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print(f"Shutting down {settings.SERVICE_NAME}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
