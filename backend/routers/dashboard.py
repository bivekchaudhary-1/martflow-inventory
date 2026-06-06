from fastapi import APIRouter
from database import items, categories, locations, suppliers, transactions, alerts
from datetime import date

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats():
    active_items = [i for i in items if i.is_active]
    today = date.today().isoformat()

    vel = {"fast": 0, "medium": 0, "slow": 0}
    for i in active_items:
        vel[i.velocity_status] = vel.get(i.velocity_status, 0) + 1

    cat_stats = []
    for c in categories:
        cat_items = [i for i in active_items if i.category_id == c.id]
        cat_stats.append({
            "name":  c.name,
            "count": len(cat_items),
            "value": sum(i.stock_count * i.unit_price for i in cat_items),
        })

    return {
        "total_items":         len(active_items),
        "total_categories":    len(categories),
        "total_locations":     len([l for l in locations if l.is_active]),
        "total_suppliers":     len([s for s in suppliers if s.is_active]),
        "total_stock_value":   sum(i.stock_count * i.unit_price for i in active_items),
        "low_stock_count":     sum(1 for i in active_items if i.stock_count < i.min_stock),
        "out_of_stock_count":  sum(1 for i in active_items if i.stock_count == 0),
        "active_alerts":       sum(1 for a in alerts if not a.is_acknowledged),
        "transactions_today":  sum(1 for t in transactions if t.created_at and t.created_at.date().isoformat() == today),
        "items_by_velocity":   vel,
        "items_by_category":   cat_stats,
        # Legacy aliases for frontend compatibility
        "totalItems":          len(active_items),
        "totalQuantity":       sum(i.stock_count for i in active_items),
        "lowStockCount":       sum(1 for i in active_items if i.stock_count < i.min_stock),
        "totalLocations":      len([l for l in locations if l.is_active]),
        "totalValue":          sum(i.stock_count * i.unit_price for i in active_items),
        "recentItems":         [i.model_dump() for i in sorted(active_items, key=lambda x: x.id, reverse=True)[:5]],
        "lowStockItems":       [i.model_dump() for i in sorted(
                                    [i for i in active_items if i.stock_count < i.min_stock],
                                    key=lambda x: x.stock_count
                                )[:5]],
    }
