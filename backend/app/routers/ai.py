from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.services.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/ai", tags=["ai"])

class AnalyzeLogRequest(BaseModel):
    log_type: str
    raw_log: str

@router.post("/analyze-log")
async def analyze_log(req: AnalyzeLogRequest, db: AsyncSession = Depends(get_db)):
    if not req.raw_log.strip():
        raise HTTPException(status_code=400, detail="Raw log content is empty")

    # Execute the complete Multi-Agent analysis flow
    result = await AgentOrchestrator.process_log(req.log_type, req.raw_log, db)
    
    if not result["success"]:
        # Payload was blocked by Security Guardian
        return {
            "threat_detected": True,
            "severity": "HIGH",
            "classification": "Security Block: Policy Violation",
            "summary": f"Ingested payload was blocked by Security Guardian. Reason: {result['reason']}",
            "recommended_playbook": {
                "action_type": "BLOCK_PAYLOAD",
                "steps": [
                    "Isolate the log ingestion interface",
                    "Notify security analysts of malicious injection signatures"
                ]
            },
            "incident": result["incident"]
        }
        
    db_incident = result["incident"]
    explainability = result["explainability"]

    # Format return payload matching frontend expectations
    return {
        "threat_detected": True,
        "severity": db_incident.severity,
        "classification": db_incident.title.split(" - ")[-1] if " - " in db_incident.title else db_incident.title,
        "summary": db_incident.description,
        "recommended_playbook": {
            "action_type": db_incident.response_action,
            "steps": [
                "Configure automated rule: " + str(db_incident.response_action),
                "Generate executive investigation PDF report",
                "Flag host logs for timeline auditing"
            ]
        },
        "incident": {
            "id": db_incident.id,
            "title": db_incident.title,
            "description": db_incident.description,
            "severity": db_incident.severity,
            "source_ip": db_incident.source_ip,
            "status": db_incident.status,
            "response_action": db_incident.response_action,
            "timestamp": db_incident.timestamp.isoformat(),
            "mitre_attack": db_incident.mitre_attack,
            "cve_id": db_incident.cve_id,
            "risk_score": db_incident.risk_score,
            "confidence_score": db_incident.confidence_score,
            "attack_timeline": db_incident.attack_timeline,
            "evidence": db_incident.evidence,
            "remediation_plan": db_incident.remediation_plan,
            "pdf_path": db_incident.pdf_path
        },
        "explainability": explainability
    }
