from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import structlog
import time

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import transcription, health
from app.services.stt_service import stt_service

# Setup logging
setup_logging()
logger = structlog.get_logger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Speech-to-Text Service",
    description="Real-time speech transcription using OpenAI Whisper",
    version="1.0.0"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests and responses."""
    request_id = str(time.time())

    logger.info(
        "Incoming request",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else "unknown"
    )

    start_time = time.time()

    try:
        response = await call_next(request)

        duration = time.time() - start_time

        logger.info(
            "Request completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=int(duration * 1000)
        )

        return response
    except Exception as e:
        duration = time.time() - start_time

        logger.error(
            "Request failed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            error=str(e),
            duration_ms=int(duration * 1000),
            exc_info=True
        )
        raise

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
    await stt_service.initialize()
    print(f"{settings.SERVICE_NAME} ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print(f"Shutting down {settings.SERVICE_NAME}")
    await stt_service.cleanup()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
