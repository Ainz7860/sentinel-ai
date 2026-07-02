from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models import Incident
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

# Pydantic schemas
class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    source_ip: Optional[str] = None
    status: str
    response_action: Optional[str] = None
    timestamp: datetime
    mitre_attack: Optional[str] = None
    cve_id: Optional[str] = None
    risk_score: Optional[int] = None
    confidence_score: Optional[int] = None
    attack_timeline: Optional[str] = None
    evidence: Optional[str] = None
    remediation_plan: Optional[str] = None
    pdf_path: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    response_action: Optional[str] = None

class MitigateRequest(BaseModel):
    action: str

@router.get("", response_model=List[IncidentResponse])
async def get_incidents(
    db: AsyncSession = Depends(get_db),
    user: str = Depends(get_current_user)
):
    result = await db.execute(select(Incident).order_by(Incident.timestamp.desc()))
    return result.scalars().all()

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user: str = Depends(get_current_user)
):
    # Run queries to aggregate statistics
    total_result = await db.execute(select(func.count(Incident.id)))
    total_logs = total_result.scalar_one() or 0

    unresolved_result = await db.execute(
        select(func.count(Incident.id)).where(Incident.status != "MITIGATED")
    )
    unresolved = unresolved_result.scalar_one() or 0

    block_rules_result = await db.execute(
        select(func.count(Incident.id)).where(Incident.response_action == "BLOCK_IP")
    )
    block_rules = block_rules_result.scalar_one() or 0

    # Determine highest active severity threat level
    threat_result = await db.execute(
        select(Incident.severity).where(Incident.status != "MITIGATED")
    )
    unresolved_severities = threat_result.scalars().all()

    threat_level = "LOW"
    if "CRITICAL" in unresolved_severities:
        threat_level = "CRITICAL"
    elif "HIGH" in unresolved_severities:
        threat_level = "HIGH"
    elif "MEDIUM" in unresolved_severities:
        threat_level = "MEDIUM"
    elif unresolved_severities:
        threat_level = "MODERATE"

    return {
        "threatLevel": threat_level,
        "unresolved": unresolved,
        "totalLogs": total_logs,
        "blockRules": block_rules
    }

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int, 
    req: IncidentUpdate, 
    db: AsyncSession = Depends(get_db),
    user: str = Depends(get_current_user)
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if req.status is not None:
        incident.status = req.status
    if req.response_action is not None:
        incident.response_action = req.response_action

    await db.commit()
    await db.refresh(incident)
    return incident

@router.post("/{incident_id}/mitigate")
async def execute_mitigation(
    incident_id: int, 
    req: MitigateRequest, 
    db: AsyncSession = Depends(get_db),
    user: str = Depends(get_current_user)
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    action_executed = f"MOCK_ACTION_SUCCESS: {req.action} applied for target {incident.source_ip or 'host'}"
    
    incident.status = "MITIGATED"
    incident.response_action = req.action
    await db.commit()
    
    return {
        "status": "success",
        "action_executed": action_executed,
        "message": "Mitigation playbook completed successfully."
    }
