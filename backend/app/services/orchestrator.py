import time
import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.agents import SecurityGuardianAgent, InvestigatorAgent, ThreatIntelligenceAgent, ResponsePlannerAgent
from app.services.pdf_generator import PDFReportGenerator
from app.models import Incident, ObservabilityMetric

logger = logging.getLogger("sentinel.orchestrator")

class AgentOrchestrator:
    @staticmethod
    async def process_log(
        log_type: str, 
        raw_log: str, 
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Coordinates the execution of all security agents, logs observability metrics,
        and saves the consolidated incident threat to the database.
        """
        start_time = time.time()
        
        # 1. Invoke Security Guardian Agent (Sanitization check)
        guardian_start = time.time()
        guardian_res = SecurityGuardianAgent.validate_payload(raw_log)
        guardian_duration = int((time.time() - guardian_start) * 1000)
        
        # Log Guardian metric
        db.add(ObservabilityMetric(
            agent_name="Security Guardian",
            event_type="invocation",
            duration_ms=guardian_duration,
            details=f"Validation result: {guardian_res['reason']}"
        ))
        
        if not guardian_res["safe"]:
            # If payload is unsafe, log immediate incident block and abort
            blocked_incident = Incident(
                title="Security Block: Prompt Injection Attempt",
                description=f"Log analyzer blocked an unsafe ingestion payload. Reason: {guardian_res['reason']}",
                severity="HIGH",
                source_ip="127.0.0.1",
                status="MITIGATED",
                response_action="BLOCK_PAYLOAD"
            )
            db.add(blocked_incident)
            await db.commit()
            await db.refresh(blocked_incident)
            
            return {
                "success": False,
                "blocked": True,
                "reason": guardian_res["reason"],
                "incident": blocked_incident
            }

        # 2. Invoke Investigator Agent
        investigator_start = time.time()
        investigation = await InvestigatorAgent.investigate(log_type, raw_log, db)
        investigator_duration = int((time.time() - investigator_start) * 1000)
        
        db.add(ObservabilityMetric(
            agent_name="Investigator Agent",
            event_type="invocation",
            duration_ms=investigator_duration,
            details=f"Extracted {len(investigation['iocs']['ips'])} IPs, {len(investigation['iocs']['hashes'])} hashes."
        ))

        # 3. Invoke Threat Intelligence Agent
        intel_start = time.time()
        intel = await ThreatIntelligenceAgent.analyze_threat(log_type, investigation, db)
        intel_duration = int((time.time() - intel_start) * 1000)
        
        db.add(ObservabilityMetric(
            agent_name="Threat Intelligence Agent",
            event_type="invocation",
            duration_ms=intel_duration,
            details=f"Threat rated as {intel.get('severity')}. Risk score: {intel.get('risk_score')}."
        ))

        # 4. Invoke Response Planner Agent
        planner_start = time.time()
        plan = await ResponsePlannerAgent.plan_response(log_type, investigation, intel, db)
        planner_duration = int((time.time() - planner_start) * 1000)
        
        db.add(ObservabilityMetric(
            agent_name="Response Planner Agent",
            event_type="invocation",
            duration_ms=planner_duration,
            details=f"Mitigation plan scheduled: {plan.get('action_type')}."
        ))

        # 5. Save consolidate incident to the Database
        db_incident = Incident(
            title=f"{intel.get('severity')} - {intel.get('mitre_attack', 'Security Alert')}",
            description=intel.get("summary", "No details provided by threat intel."),
            severity=intel.get("severity", "MEDIUM"),
            source_ip=investigation.get("source_ip"),
            status="UNRESOLVED",
            response_action=plan.get("action_type"),
            mitre_attack=intel.get("mitre_attack"),
            cve_id=intel.get("cve_id"),
            risk_score=intel.get("risk_score", 50),
            confidence_score=intel.get("confidence_score", 80),
            attack_timeline=json.dumps(plan.get("timeline")),
            evidence=json.dumps(investigation.get("iocs")),
            remediation_plan=plan.get("remediation_plan"),
            pdf_path=""  # We will regenerate the PDF with the correct database primary key ID next
        )
        
        db.add(db_incident)
        await db.commit()
        await db.refresh(db_incident)
        
        # 6. Re-compile PDF report with the correct database Incident ID
        try:
            pdf_path = PDFReportGenerator.generate_incident_report(db_incident)
            # Store relative download URL in database
            pdf_url = f"/static/reports/incident_{db_incident.id}_report.pdf"
            db_incident.pdf_path = pdf_url
            await db.commit()
        except Exception as pdf_err:
            logger.error(f"Failed to update database PDF path: {pdf_err}")
        
        # Log total duration
        total_duration = int((time.time() - start_time) * 1000)
        db.add(ObservabilityMetric(
            agent_name="Orchestrator",
            event_type="invocation",
            duration_ms=total_duration,
            details=f"Completed full multi-agent flow for incident #{db_incident.id}."
        ))
        await db.commit()

        return {
            "success": True,
            "blocked": False,
            "incident": db_incident,
            "explainability": intel.get("explainability", {})
        }
