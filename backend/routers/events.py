"""
Events Router — Server-Sent Events (SSE)
-----------------------------------------
Implements the real-time alerting leg of the architecture:

  PostgreSQL WAL → Supabase Realtime → [this endpoint] → Browser

Since we're using an in-memory store (no real Postgres WAL), we simulate
CDC by polling the items list every 3 seconds and pushing low-stock alerts
whenever the set of low-stock items changes.

The frontend subscribes to GET /events/stream and receives:
  - "low_stock"  events when an item drops below the threshold
  - "heartbeat"  events every 15s to keep the connection alive
  - "audit"      events when a new audit entry is written

In production, replace the polling loop with a Supabase Realtime subscription
or a Kafka consumer that forwards messages to connected SSE clients.
"""

import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from database import items
import audit as audit_service

router = APIRouter()

LOW_STOCK_THRESHOLD = 10
_last_audit_id = 0          # tracks last audit entry pushed to clients


async def _event_stream():
    """Async generator that yields SSE-formatted strings."""
    global _last_audit_id

    seen_low_stock: set[int] = set()
    tick = 0

    while True:
        await asyncio.sleep(3)
        tick += 1
        now = datetime.now(timezone.utc).isoformat()

        # ── Low-stock alerts ──────────────────────────────────────────────────
        current_low = {i.id for i in items if i.stock_count < LOW_STOCK_THRESHOLD}
        newly_low   = current_low - seen_low_stock
        recovered   = seen_low_stock - current_low

        for item_id in newly_low:
            item = next((i for i in items if i.id == item_id), None)
            if item:
                payload = json.dumps({
                    "type":        "low_stock",
                    "item_id":     item.id,
                    "item_name":   item.name,
                    "stock_count": item.stock_count,
                    "location":    item.location,
                    "timestamp":   now,
                })
                yield f"event: low_stock\ndata: {payload}\n\n"

        for item_id in recovered:
            item = next((i for i in items if i.id == item_id), None)
            name = item.name if item else f"Item #{item_id}"
            payload = json.dumps({
                "type":      "stock_recovered",
                "item_id":   item_id,
                "item_name": name,
                "timestamp": now,
            })
            yield f"event: stock_recovered\ndata: {payload}\n\n"

        seen_low_stock = current_low

        # ── New audit entries ─────────────────────────────────────────────────
        all_entries = audit_service.get_log(limit=500)
        new_entries = [e for e in reversed(all_entries) if e.id > _last_audit_id]
        for entry in new_entries:
            payload = json.dumps({
                "type":        "audit",
                "id":          entry.id,
                "action":      entry.action,
                "entity_name": entry.entity_name,
                "entity_id":   entry.entity_id,
                "username":    entry.username,
                "meta":        entry.meta,
                "timestamp":   entry.timestamp.isoformat(),
            })
            yield f"event: audit\ndata: {payload}\n\n"
            _last_audit_id = max(_last_audit_id, entry.id)

        # ── Heartbeat every 15s ───────────────────────────────────────────────
        if tick % 5 == 0:
            yield f"event: heartbeat\ndata: {json.dumps({'timestamp': now})}\n\n"


@router.get("/stream")
async def event_stream():
    return StreamingResponse(
        _event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",   # disable nginx buffering
            "Access-Control-Allow-Origin": "*",
        },
    )
