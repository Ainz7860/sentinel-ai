from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.models import SecurityLog
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/logs", tags=["logs"])

class LogUploadRequest(BaseModel):
    log_type: str
    raw_content: str

@router.post("/upload")
async def upload_log(
    req: LogUploadRequest, 
    db: AsyncSession = Depends(get_db),
    user: str = Depends(get_current_user)
):
    """
    Ingests and stores a raw security log payload.
    """
    if not req.raw_content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    db_log = SecurityLog(
        log_type=req.log_type,
        raw_content=req.raw_content,
        analyzed=False
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)

    return {"status": "success", "log_id": db_log.id}
