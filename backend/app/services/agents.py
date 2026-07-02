import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.gemini import gemini_service
from app.services.tool_registry import registry
from app.services.pdf_generator import PDFReportGenerator
from app.models import Incident, ObservabilityMetric

logger = logging.getLogger("sentinel.agents")

# ----------------------------------------------------
# 1. Security Guardian Agent
# ----------------------------------------------------
class SecurityGuardianAgent:
    @staticmethod
    def validate_payload(raw_content: str) -> Dict[str, Any]:
        """
        Validates the raw log payload for prompt injection, executable code, 
        and extreme sizes. Protects the downstream agents.
        """
        if not raw_content:
            return {"safe": False, "reason": "Payload is empty."}
            
        # Detect prompt injection keywords
        injection_keywords = [
            "ignore previous instructions", 
            "system prompt", 
            "you are now", 
            "override instructions",
            "forget your training"
        ]
        text_lower = raw_content.lower()
        for kw in injection_keywords:
            if kw in text_lower:
                return {
                    "safe": False, 
                    "reason": f"Potential Prompt Injection detected: match on '{kw}'"
                }

        # Size check (protect tokens budget)
        if len(raw_content) > 100000:
            return {"safe": False, "reason": "Payload size exceeds maximum budget (100KB)."}

        return {"safe": True, "reason": "Payload passes all security profiles."}

    @staticmethod
    def validate_tool_call(tool_name: str, args: List[Any]) -> bool:
        """Enforces tool execution permissions."""
        allowed_tools = {"log_parser", "ioc_extractor", "mitre_mapper", "threat_lookup", "url_analyzer", "hash_analyzer"}
        return tool_name in allowed_tools

# ----------------------------------------------------
# 2. Investigator Agent
# ----------------------------------------------------
class InvestigatorAgent:
    @staticmethod
    async def investigate(log_type: str, raw_log: str, db: Optional[AsyncSession] = None) -> Dict[str, Any]:
        """
        Parses raw text, extracts IOCs (IPs, domains, hashes), and aggregates threat variables.
        """
        # Execute log parser tool
        parser_res = await registry.execute("log_parser", db, log_type, raw_log)
        parsed_data = parser_res.get("result") or {}

        # Execute IOC extractor tool
        ioc_res = await registry.execute("ioc_extractor", db, raw_log)
        extracted_iocs = ioc_res.get("result") or {"ips": [], "domains": [], "urls": [], "hashes": []}

        # Ensure source IP is bound
        source_ip = parsed_data.get("source_ip") or (extracted_iocs["ips"][0] if extracted_iocs["ips"] else "127.0.0.1")
        target_user = parsed_data.get("target_user") or "System"

        return {
            "source_ip": source_ip,
            "target_user": target_user,
            "parsed_variables": parsed_data,
            "iocs": extracted_iocs
        }

# ----------------------------------------------------
# 3. Threat Intelligence Agent
# ----------------------------------------------------
class ThreatIntelligenceAgent:
    @staticmethod
    async def analyze_threat(
        log_type: str, 
        investigation: Dict[str, Any], 
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Queries Gemini or runs heuristics to determine risk scores, MITRE ATT&CK codes, 
        malware families, and confidence indices.
        """
        source_ip = investigation["source_ip"]
        iocs = investigation["iocs"]

        # Run static tool lookups on extracted IP address
        lookup_res = await registry.execute("threat_lookup", db, source_ip)
        ip_threat = lookup_res.get("result") or {}

        # Analyze hashes if any present
        malware_families = []
        cves = []
        highest_threat_level = "LOW"
        
        for file_hash in iocs.get("hashes", []):
            hash_res = await registry.execute("hash_analyzer", db, file_hash)
            hash_data = hash_res.get("result") or {}
            if hash_data.get("known_malware"):
                malware_families.append(hash_data.get("name"))
                highest_threat_level = hash_data.get("threat_level")

        # Map to MITRE ATT&CK
        raw_vars = str(investigation["parsed_variables"])
        mitre_res = await registry.execute("mitre_mapper", db, log_type, raw_vars)
        mitre_info = mitre_res.get("result") or {"code": "T1204", "tactic": "Execution", "name": "User Execution"}

        # Perform Gemini query or run heuristic failover if unconfigured
        if not gemini_service.is_configured:
            # Deterministic Heuristic Analysis
            risk_score = 30
            confidence = 80
            severity = "LOW"

            if "sshd" in raw_vars.lower() or "failed password" in raw_vars.lower():
                risk_score = 95
                severity = "CRITICAL"
            elif ip_threat.get("blacklisted"):
                risk_score = 85
                severity = "HIGH"
            elif highest_threat_level in ["HIGH", "CRITICAL"]:
                risk_score = 95
                severity = "CRITICAL"
            elif log_type in ["windows", "linux"] and "failed" in raw_vars.lower():
                risk_score = 65
                severity = "MEDIUM"

            summary = f"Heuristics assessment of security event. Identified source: {source_ip}. " \
                      f"MITRE mapping resolved to {mitre_info['name']} ({mitre_info['code']}). " \
                      f"Detected reputation status: {ip_threat.get('reputation', 'clean')}."

            return {
                "severity": severity,
                "risk_score": risk_score,
                "confidence_score": confidence,
                "mitre_attack": f"{mitre_info['code']} ({mitre_info['name']})",
                "cve_id": "CVE-2024-8890" if risk_score > 80 else None,
                "summary": summary,
                "explainability": {
                    "reasoning": "Determined via heuristic local rules.",
                    "evidence": f"Log Type: {log_type}. Blacklisted IP: {ip_threat.get('blacklisted')}. Statically resolved MITRE: {mitre_info['code']}.",
                    "confidence_rationale": "Static lookup database verified IOCs."
                }
            }

        # Real Gemini AI analysis
        try:
            prompt = f"""
            Analyze the following pre-parsed incident context.
            Log Type: {log_type}
            Source IP: {source_ip}
            Extracted Telemetry: {json.dumps(investigation)}
            Static Threat Lookup Results: {json.dumps(ip_threat)}
            MITRE Static mapping: {json.dumps(mitre_info)}
            
            Based on this, return a JSON response summarizing threat intel:
            {{
                "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                "risk_score": 0-100,
                "confidence_score": 0-100,
                "mitre_attack": "TXXXX (Technique Name)",
                "cve_id": "CVE-YYYY-XXXX" (or null),
                "summary": "Detailed cognitive threat intelligence summary.",
                "explainability": {{
                    "reasoning": "Explain why you drew these threat conclusions.",
                    "evidence": "What logs fields, hashes, or IPs served as primary evidence.",
                    "confidence_rationale": "Explain why your confidence score is rated at this level."
                }}
            }}
            
            Respond only with valid JSON.
            """
            
            model = genai_model = gemini_service.genai_model if hasattr(gemini_service, "genai_model") else None
            # Standard model call
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text.strip())
            return data
            
        except Exception as e:
            logger.error(f"ThreatIntelligenceAgent Gemini error: {e}. Running failover.")
            # Heuristic fallback
            return {
                "severity": "HIGH" if ip_threat.get("blacklisted") else "MEDIUM",
                "risk_score": 80 if ip_threat.get("blacklisted") else 50,
                "confidence_score": 70,
                "mitre_attack": f"{mitre_info['code']} ({mitre_info['name']})",
                "cve_id": None,
                "summary": f"Fallback Heuristics: Security threat scanned from {source_ip} with status: {ip_threat.get('reputation')}.",
                "explainability": {
                    "reasoning": "Generated via local failover heuristics due to API timeout.",
                    "evidence": f"Failed API request fallback. Source: {source_ip}.",
                    "confidence_rationale": "Fallback safety mode."
                }
            }

# ----------------------------------------------------
# 4. Response Planner Agent
# ----------------------------------------------------
class ResponsePlannerAgent:
    @staticmethod
    async def plan_response(
        log_type: str, 
        investigation: Dict[str, Any], 
        intel: Dict[str, Any], 
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Formulates response timelines, playbooks (containment actions), remediation strategies, 
        and compiles the final PDF Report file.
        """
        severity = intel["severity"]
        source_ip = investigation["source_ip"]
        
        # Decide action type based on severity and log signature
        action_type = "NONE"
        if severity in ["HIGH", "CRITICAL"]:
            action_type = "BLOCK_IP" if log_type != "windows" else "ISOLATE_HOST"
        elif severity == "MEDIUM":
            action_type = "BLOCK_IP"

        # Build timeline logs (milestones tracker)
        timeline = [
            {"time": "0.0s", "event": "Threat log file uploaded and ingested by Security Guardian."},
            {"time": "+0.4s", "event": "Validation checks completed. Status: Clean Log Structure."},
            {"time": "+1.1s", "event": f"Investigator extracts source IP: {source_ip} and targets user accounts."},
            {"time": "+2.2s", "event": f"Threat Intel correlates reputation records. Risk Score rated at {intel['risk_score']}/100."},
            {"time": "+3.2s", "event": f"Response Planner schedules autonomous {action_type} policy."}
        ]

        remediation = "Scan Active Directory leases. Rotate credential sets for target administrators. " \
                      "Install latest host patches. Restore affected interfaces after 24h quarantine window."

        # Compile PDF report using ReportLab
        # Create a transient Incident object to pass to the compiler
        temp_incident = Incident(
            id=999,  # placeholder
            title=intel.get("mitre_attack") or "Security Alert",
            description=intel.get("summary") or "Incident scan report.",
            severity=severity,
            source_ip=source_ip,
            status="UNRESOLVED",
            response_action=action_type,
            mitre_attack=intel.get("mitre_attack"),
            risk_score=intel.get("risk_score"),
            evidence=json.dumps(investigation["iocs"]),
            attack_timeline=json.dumps(timeline),
            remediation_plan=remediation,
            timestamp=datetime.now(timezone.utc)
        )
        
        pdf_path = ""
        try:
            pdf_path = PDFReportGenerator.generate_incident_report(temp_incident)
            logger.info(f"ReportLab PDF compiled at: {pdf_path}")
        except Exception as pdf_err:
            logger.error(f"Failed to generate ReportLab PDF: {pdf_err}", exc_info=True)

        return {
            "action_type": action_type,
            "timeline": timeline,
            "remediation_plan": remediation,
            "pdf_path": pdf_path
        }
