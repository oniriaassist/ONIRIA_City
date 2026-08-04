from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.admin_dependencies import require_database, require_permission
from app.repositories.admin_repository import AdminRepository
from app.services.export_service import csv_bytes, xlsx_bytes

router = APIRouter(prefix="/admin", tags=["admin dashboard"])


@router.get("/dashboard")
async def dashboard(database=Depends(require_database), staff=Depends(require_permission("admin:dashboard"))):
    return {"success": True, "data": await AdminRepository(database).dashboard()}


@router.get("/campaigns")
async def campaigns(database=Depends(require_database), staff=Depends(require_permission("campaigns:view"))):
    rows = await database.fetch("SELECT * FROM campaign_performance ORDER BY leads DESC")
    return {"success": True, "data": rows}


@router.get("/follow-ups")
async def follow_ups(database=Depends(require_database), staff=Depends(require_permission("admin:dashboard"))):
    rows = await database.fetch("SELECT * FROM sales_follow_up_queue ORDER BY is_overdue DESC, follow_up_due_at ASC")
    return {"success": True, "data": rows}


@router.get("/data-export")
async def export_customer_data(
    export_format: str = Query(default="xlsx", alias="format", pattern="^(csv|xlsx)$"),
    dataset: str = Query(default="all", pattern="^(all|leads|enquiries|customers)$"),
    database=Depends(require_database),
    staff=Depends(require_permission("leads:view_all")),
):
    """Download read-only customer, lead and enquiry data.

    Only authorised staff can use this endpoint. Passwords, sessions and other
    authentication data are never included in the export.
    """
    data = await AdminRepository(database).export_customer_data()
    stamp = date.today().isoformat()

    if export_format == "csv":
        if dataset == "all":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Choose leads, enquiries or customers for CSV export.",
            )
        content = csv_bytes(data[dataset])
        filename = f"oniria-{dataset}-{stamp}.csv"
        return Response(
            content=content,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    selected = data.items() if dataset == "all" else [(dataset, data[dataset])]
    content = xlsx_bytes((name.title(), rows) for name, rows in selected)
    filename = f"oniria-customer-data-{stamp}.xlsx" if dataset == "all" else f"oniria-{dataset}-{stamp}.xlsx"
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
