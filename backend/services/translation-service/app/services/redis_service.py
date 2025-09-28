import redis.asyncio as redis
import json
import hashlib
from typing import Optional, Dict, Any, List
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

class RedisService:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.connected = False

    async def connect(self) -> None:
        """Connect to Redis."""
        try:
            self.client = redis.Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                max_connections=20
            )
            await self.client.ping()
            self.connected = True
            logger.info("Connected to Redis", url=settings.REDIS_URL)
        except Exception as e:
            logger.warning("Failed to connect to Redis - continuing without cache", error=str(e))
            self.connected = False

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self.client:
            await self.client.close()
            self.connected = False
            logger.info("Disconnected from Redis")

    def _get_translation_key(self, text: str, source_lang: str, target_lang: str) -> str:
        """Generate cache key for translation."""
        content = f"{text}:{source_lang}:{target_lang}"
        hash_key = hashlib.md5(content.encode()).hexdigest()
        return f"translation:{hash_key}"

    def _get_stats_key(self) -> str:
        """Get statistics key."""
        return "translation_stats"

    def _get_rate_limit_key(self, user_id: str) -> str:
        """Get rate limiting key."""
        return f"rate_limit:{user_id}"

    async def cache_translation(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        translated_text: str,
        confidence: Optional[float] = None,
        processing_time_ms: Optional[int] = None
    ) -> None:
        """Cache a translation result."""
        if not self.connected:
            return

        try:
            key = self._get_translation_key(text, source_lang, target_lang)
            value = {
                "translated_text": translated_text,
                "confidence": confidence,
                "processing_time_ms": processing_time_ms,
                "cached_at": "utcnow"
            }

            await self.client.setex(
                key,
                settings.CACHE_TTL_SECONDS,
                json.dumps(value)
            )

            logger.debug(
                "Translation cached",
                source_lang=source_lang,
                target_lang=target_lang,
                text_length=len(text)
            )
        except Exception as e:
            logger.warning("Failed to cache translation", error=str(e))

    async def get_cached_translation(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached translation."""
        if not self.connected:
            return None

        try:
            key = self._get_translation_key(text, source_lang, target_lang)
            cached = await self.client.get(key)

            if cached:
                result = json.loads(cached)
                logger.debug(
                    "Translation cache hit",
                    source_lang=source_lang,
                    target_lang=target_lang,
                    text_length=len(text)
                )
                return result

            return None
        except Exception as e:
            logger.warning("Failed to get cached translation", error=str(e))
            return None

    async def increment_stats(
        self,
        cache_hit: bool = False,
        processing_time_ms: Optional[int] = None,
        source_lang: str = "",
        target_lang: str = "",
        error: bool = False
    ) -> None:
        """Increment translation statistics."""
        if not self.connected:
            return

        try:
            stats_key = self._get_stats_key()

            # Use pipeline for atomic operations
            async with self.client.pipeline() as pipe:
                await pipe.hincrby(stats_key, "total_translations", 1)

                if cache_hit:
                    await pipe.hincrby(stats_key, "cache_hits", 1)

                if processing_time_ms:
                    await pipe.hincrby(stats_key, "total_processing_time", processing_time_ms)

                if source_lang and target_lang:
                    pair_key = f"pair:{source_lang}:{target_lang}"
                    await pipe.hincrby(stats_key, pair_key, 1)

                if error:
                    await pipe.hincrby(stats_key, "errors", 1)

                await pipe.execute()

        except Exception as e:
            logger.warning("Failed to update stats", error=str(e))

    async def get_stats(self) -> Dict[str, Any]:
        """Get translation statistics."""
        if not self.connected:
            return {}

        try:
            stats_key = self._get_stats_key()
            stats = await self.client.hgetall(stats_key)

            if not stats:
                return {
                    "total_translations": 0,
                    "cache_hits": 0,
                    "cache_hit_rate": 0.0,
                    "average_processing_time_ms": 0.0,
                    "popular_language_pairs": [],
                    "error_rate": 0.0
                }

            total = int(stats.get("total_translations", 0))
            cache_hits = int(stats.get("cache_hits", 0))
            total_time = int(stats.get("total_processing_time", 0))
            errors = int(stats.get("errors", 0))

            # Calculate rates
            cache_hit_rate = (cache_hits / total * 100) if total > 0 else 0.0
            avg_time = (total_time / (total - cache_hits)) if (total - cache_hits) > 0 else 0.0
            error_rate = (errors / total * 100) if total > 0 else 0.0

            # Get popular language pairs
            pairs = []
            for key, value in stats.items():
                if key.startswith("pair:"):
                    source, target = key.replace("pair:", "").split(":")
                    pairs.append({
                        "source_language": source,
                        "target_language": target,
                        "count": int(value)
                    })

            pairs.sort(key=lambda x: x["count"], reverse=True)

            return {
                "total_translations": total,
                "cache_hits": cache_hits,
                "cache_hit_rate": round(cache_hit_rate, 2),
                "average_processing_time_ms": round(avg_time, 2),
                "popular_language_pairs": pairs[:10],  # Top 10
                "error_rate": round(error_rate, 2)
            }

        except Exception as e:
            logger.warning("Failed to get stats", error=str(e))
            return {}

    async def check_rate_limit(self, user_id: str) -> bool:
        """Check if user is within rate limits."""
        if not self.connected:
            return True  # Allow if Redis is down

        try:
            key = self._get_rate_limit_key(user_id)
            current = await self.client.incr(key)

            if current == 1:
                await self.client.expire(key, settings.RATE_LIMIT_WINDOW)

            return current <= settings.RATE_LIMIT_REQUESTS

        except Exception as e:
            logger.warning("Failed to check rate limit", error=str(e))
            return True  # Allow if check fails

    async def store_batch_result(self, batch_id: str, result: Dict[str, Any]) -> None:
        """Store batch translation result."""
        if not self.connected:
            return

        try:
            key = f"batch:{batch_id}"
            await self.client.setex(
                key,
                3600,  # 1 hour TTL
                json.dumps(result)
            )
        except Exception as e:
            logger.warning("Failed to store batch result", error=str(e))

    async def get_batch_result(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get batch translation result."""
        if not self.connected:
            return None

        try:
            key = f"batch:{batch_id}"
            result = await self.client.get(key)
            return json.loads(result) if result else None
        except Exception as e:
            logger.warning("Failed to get batch result", error=str(e))
            return None