from fastapi import APIRouter, HTTPException
from typing import List
from models import Location, LocationCreate, LocationUpdate
from database import locations

router = APIRouter()


@router.get("/", response_model=List[Location])
def list_locations():
    return [l for l in locations if l.is_active]


@router.get("/{location_id}", response_model=Location)
def get_location(location_id: int):
    loc = next((l for l in locations if l.id == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc


@router.post("/", response_model=Location)
def create_location(payload: LocationCreate):
    new_id = max((l.id for l in locations), default=0) + 1
    loc = Location(id=new_id, **payload.model_dump(), is_active=True)
    locations.append(loc)
    return loc


@router.put("/{location_id}", response_model=Location)
def update_location(location_id: int, payload: LocationUpdate):
    loc = next((l for l in locations if l.id == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(loc, field, value)
    return loc


@router.delete("/{location_id}")
def delete_location(location_id: int):
    loc = next((l for l in locations if l.id == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    loc.is_active = False   # soft delete
    return {"detail": "Location deactivated"}
