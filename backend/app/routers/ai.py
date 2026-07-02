from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.services.gemini import gemini_service
from app.services.log_parser import extract_log_telemetry
from app.models import Incident

router = APIRouter(prefix="/api/ai", tags=["ai"])

class AnalyzeLogRequest(BaseModel):
    log_type: str
    raw_log: str

@router.post("/analyze-log")
async def analyze_log(req: AnalyzeLogRequest, db: AsyncSession = Depends(get_db)):
    if not req.raw_log.strip():
        raise HTTPException(status_code=400, detail="Raw log content is empty")

    # 1. Run regex pre-parser to extract telemetry details
    telemetry = extract_log_telemetry(req.raw_log)

    # 2. Invoke Gemini for cognitive reasoning
    analysis = await gemini_service.analyze_security_log(req.log_type, req.raw_log)

    # 3. If threat detected, write to DB
    db_incident = None
    if analysis.get("threat_detected", False):
        db_incident = Incident(
            title=analysis.get("classification", "Unknown threat"),
            description=analysis.get("summary", "No threat details provided by AI."),
            severity=analysis.get("severity", "MEDIUM"),
            source_ip=telemetry.get("source_ip") or "127.0.0.1",
            status="UNRESOLVED"
        )
        db.add(db_incident)
        await db.commit()
        await db.refresh(db_incident)

    return {
        "threat_detected": analysis.get("threat_detected", False),
        "severity": analysis.get("severity", "LOW"),
        "classification": analysis.get("classification", "N/A"),
        "summary": analysis.get("summary", ""),
        "recommended_playbook": analysis.get("recommended_playbook", {}),
        "incident": db_incident
    }
