from fastapi import APIRouter, Depends
from app.models.translation import HealthCheck
from app.services.translation_service import TranslationService
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()

async def get_translation_service() -> TranslationService:
    """Dependency to get translation service from app state."""
    from main import app
    return app.state.translation_service

@router.get("", response_model=HealthCheck)
@router.get("/", response_model=HealthCheck)
async def health_check(
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Health check endpoint."""
    try:
        health_data = await translation_service.health_check()

        return HealthCheck(
            status=health_data["status"],
            version="1.0.0",
            dependencies=health_data["dependencies"],
            uptime_seconds=health_data["uptime_seconds"]
        )
    except Exception as e:
        logger.error("❌ Health check failed", error=str(e))
        return HealthCheck(
            status="unhealthy",
            version="1.0.0",
            dependencies={"error": str(e)},
            uptime_seconds=0.0
        )

@router.get("/ready")
async def readiness_check(
    translation_service: TranslationService = Depends(get_translation_service)
):
    """Readiness check for Kubernetes."""
    try:
        health_data = await translation_service.health_check()
        if health_data["status"] == "healthy":
            return {"status": "ready"}
        else:
            return {"status": "not_ready", "dependencies": health_data["dependencies"]}
    except Exception as e:
        logger.error("❌ Readiness check failed", error=str(e))
        return {"status": "not_ready", "error": str(e)}

@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes."""
    return {"status": "alive"}