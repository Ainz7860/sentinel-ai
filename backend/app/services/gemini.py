import json
import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("sentinel.gemini")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.is_configured = bool(self.api_key)
        if self.is_configured:
            genai.configure(api_key=self.api_key)
            logger.info("Gemini Service initialized with API Key.")
        else:
            logger.warning("Gemini API key is missing. Running in Simulation/Fallback Mode.")

    async def analyze_security_log(self, log_type: str, raw_log: str) -> dict:
        if not self.is_configured:
            return self._simulate_analysis(log_type, raw_log)

        try:
            # We configure gemini-2.5-flash model
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""
            You are an advanced autonomous cybersecurity response agent. Analyze the following raw security log.
            
            Log Type: {log_type}
            Raw Log:
            {raw_log}
            
            Your task is to classify this threat, rate the severity level (LOW, MEDIUM, HIGH, CRITICAL), summarize the threat intel, and recommend a response playbook.
            
            You must output your response as a valid JSON object matching the following structure:
            {{
                "threat_detected": true/false,
                "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                "classification": "Brief category name of the attack",
                "summary": "Detailed explanation of what the log shows, including attacker source IP or target accounts.",
                "recommended_playbook": {{
                    "action_type": "BLOCK_IP" | "ISOLATE_HOST" | "NONE",
                    "steps": [
                        "Step 1 mitigation",
                        "Step 2 mitigation",
                        ...
                    ]
                }}
            }}
            
            Respond ONLY with the JSON object. Do not include markdown code block syntax.
            """
            
            response = await model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text.strip())
            return data
            
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}. Falling back to simulation.", exc_info=True)
            return self._simulate_analysis(log_type, raw_log)

    def _simulate_analysis(self, log_type: str, raw_log: str) -> dict:
        # High fidelity simulated fallback when Gemini Key is absent
        import re
        
        # Simple extraction helper
        ip_match = re.search(r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", raw_log)
        source_ip = ip_match.group(1) if ip_match else "192.168.1.100"
        
        user_match = re.search(r"user\s+(\w+)", raw_log, re.IGNORECASE)
        user = user_match.group(1) if user_match else "Administrator"
        
        result = {
            "threat_detected": True,
            "severity": "HIGH",
            "classification": "Intrusion Threat Signature",
            "summary": "Simulated security event analysis.",
            "recommended_playbook": {
                "action_type": "BLOCK_IP",
                "steps": [
                    "Block the malicious source IP in local firewall",
                    "Investigate affected host for other signs of compromise"
                ]
            }
        }
        
        if "4625" in raw_log or "failed logon" in raw_log.lower():
            result["classification"] = "Windows Audit Logon Failure (Brute Force)"
            result["severity"] = "HIGH"
            result["summary"] = f"Multiple failed login attempts detected for account '{user}' from source IP {source_ip}. Threat pattern indicates dictionary brute force scanning."
            result["recommended_playbook"] = {
                "action_type": "BLOCK_IP",
                "steps": [
                    f"Create block rule for IP {source_ip} in host firewall",
                    f"Temporarily lock account '{user}' to prevent compromise",
                    "Review security access policy guidelines"
                ]
            }
        elif "sshd" in raw_log.lower() or "failed password" in raw_log.lower():
            result["classification"] = "Linux SSH Authentication Brute Force"
            result["severity"] = "CRITICAL"
            result["summary"] = f"SSH Daemon rejected multiple passwords for user '{user}' from IP {source_ip}. Threat indicates automated botnet scan activity."
            result["recommended_playbook"] = {
                "action_type": "BLOCK_IP",
                "steps": [
                    f"Append '{source_ip}' to network hosts.deny",
                    "Enforce SSH key-based authentication only",
                    "Configure Fail2ban automated daemon"
                ]
            }
        elif "drop" in raw_log.lower() or "traffic" in raw_log.lower():
            result["classification"] = "Port Scanning Activity"
            result["severity"] = "MEDIUM"
            result["summary"] = f"Firewall dropped successive TCP packets from {source_ip} targeting ports in rapid succession. Pattern indicates reconnaissance scan."
            result["recommended_playbook"] = {
                "action_type": "BLOCK_IP",
                "steps": [
                    f"Register {source_ip} to firewall blacklist for 24h",
                    "Verify target listeners are patched against remote execution"
                ]
            }
            
        return result

gemini_service = GeminiService()
