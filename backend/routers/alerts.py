from fastapi import APIRouter, HTTPException, Request
from typing import List
from datetime import datetime, timezone
from models import Alert
from database import alerts

router = APIRouter()


@router.get("/", response_model=List[Alert])
def list_alerts(active_only: bool = False):
    result = list(reversed(alerts))
    if active_only:
        result = [a for a in result if not a.is_acknowledged]
    return result


@router.get("/active", response_model=List[Alert])
def active_alerts():
    return [a for a in reversed(alerts) if not a.is_acknowledged]


@router.put("/{alert_id}/acknowledge", response_model=Alert)
def acknowledge_alert(alert_id: int, request: Request):
    alert = next((a for a in alerts if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Read username from token if present
    username = "system"
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            from database import SECRET_KEY, ALGORITHM
            from jose import jwt
            payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub", "system")
        except Exception:
            pass

    alert.is_acknowledged = True
    alert.acknowledged_by = username
    alert.acknowledged_at = datetime.now(timezone.utc)
    return alert


@router.put("/item/{item_id}/acknowledge")
def acknowledge_item_alerts(item_id: int):
    count = 0
    for a in alerts:
        if a.item_id == item_id and not a.is_acknowledged:
            a.is_acknowledged = True
            a.acknowledged_at = datetime.now(timezone.utc)
            count += 1
    return {"acknowledged": count}


@router.delete("/{alert_id}")
def delete_alert(alert_id: int):
    global alerts
    alert = next((a for a in alerts if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alerts = [a for a in alerts if a.id != alert_id]
    return {"detail": "Alert deleted"}
