from fastapi import APIRouter, HTTPException
from typing import List
from models import Supplier, SupplierCreate, SupplierUpdate
from database import suppliers

router = APIRouter()


@router.get("/", response_model=List[Supplier])
def list_suppliers():
    return [s for s in suppliers if s.is_active]


@router.get("/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: int):
    sup = next((s for s in suppliers if s.id == supplier_id), None)
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return sup


@router.post("/", response_model=Supplier)
def create_supplier(payload: SupplierCreate):
    new_id = max((s.id for s in suppliers), default=0) + 1
    sup = Supplier(id=new_id, **payload.model_dump(), is_active=True)
    suppliers.append(sup)
    return sup


@router.put("/{supplier_id}", response_model=Supplier)
def update_supplier(supplier_id: int, payload: SupplierUpdate):
    sup = next((s for s in suppliers if s.id == supplier_id), None)
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sup, field, value)
    return sup


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int):
    sup = next((s for s in suppliers if s.id == supplier_id), None)
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    sup.is_active = False
    return {"detail": "Supplier deactivated"}
