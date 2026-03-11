# Shared Contracts

This directory stores source-of-truth contract artifacts that are shared across services.

- `meeting-events.json`: canonical meetings-only Socket.IO payload shape reference used by frontend and `chat-service`.

These files are intentionally language-agnostic so TypeScript and Python services can both reference them.
