import re
import time
import logging
from typing import Callable, Any, Dict, List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ObservabilityMetric

logger = logging.getLogger("sentinel.tools")

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}

    def register(self, name: str):
        def decorator(func: Callable):
            self.tools[name] = func
            return func
        return decorator

    async def execute(self, name: str, db: Optional[AsyncSession] = None, *args, **kwargs) -> Dict[str, Any]:
        if name not in self.tools:
            return {"success": False, "result": None, "error": f"Tool '{name}' not found."}

        start_time = time.time()
        tool_func = self.tools[name]
        
        try:
            logger.info(f"Executing tool '{name}'...")
            # If the tool is async, await it, else run normally
            import inspect
            if inspect.iscoroutinefunction(tool_func):
                result = await tool_func(*args, **kwargs)
            else:
                result = tool_func(*args, **kwargs)
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Log metrics to DB if session provided
            if db:
                try:
                    metric = ObservabilityMetric(
                        agent_name="ToolRegistry",
                        event_type="tool_call",
                        details=f"Tool '{name}' executed successfully.",
                        duration_ms=duration_ms,
                        token_count=0
                    )
                    db.add(metric)
                    await db.commit()
                except Exception as db_err:
                    logger.error(f"Failed to save tool execution metric: {db_err}")
            
            return {
                "success": True,
                "result": result,
                "duration_ms": duration_ms,
                "error": None
            }
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Error executing tool '{name}': {e}", exc_info=True)
            
            if db:
                try:
                    metric = ObservabilityMetric(
                        agent_name="ToolRegistry",
                        event_type="error",
                        details=f"Tool '{name}' failed with error: {str(e)}",
                        duration_ms=duration_ms,
                        token_count=0
                    )
                    db.add(metric)
                    await db.commit()
                except Exception as db_err:
                    logger.error(f"Failed to save tool error metric: {db_err}")

            return {
                "success": False,
                "result": None,
                "duration_ms": duration_ms,
                "error": str(e)
            }

# Initialize registry instance
registry = ToolRegistry()

# ----------------------------------------------------
# 1. Log Parser Tool
# ----------------------------------------------------
@registry.register("log_parser")
def log_parser(log_type: str, raw_log: str) -> Dict[str, Any]:
    lines = raw_log.strip().split("\n")
    parsed_fields = {}
    
    if log_type == "windows":
        for line in lines:
            if "=" in line:
                key, val = line.split("=", 1)
                parsed_fields[key.strip()] = val.strip()
            elif ":" in line and not line.startswith("Description") and not line.startswith("Subject"):
                parts = line.split(":", 1)
                parsed_fields[parts[0].strip()] = parts[1].strip()
        parsed_fields["event_id"] = parsed_fields.get("EventID")
        parsed_fields["target_user"] = parsed_fields.get("Account Name") or parsed_fields.get("TargetUserName")
        parsed_fields["source_ip"] = parsed_fields.get("Source Network Address") or parsed_fields.get("IpAddress")
        
    elif log_type == "linux":
        # Example: Jul  2 10:14:22 main-server sshd[12042]: Failed password for invalid user admin from 203.0.113.82 port 48212 ssh2
        for line in lines:
            if "sshd" in line:
                parsed_fields["daemon"] = "sshd"
                ip_match = re.search(r"from\s+([0-9\.]+)", line)
                user_match = re.search(r"for\s+(?:invalid\s+user\s+)?(\w+)\s+from", line)
                if ip_match:
                    parsed_fields["source_ip"] = ip_match.group(1)
                if user_match:
                    parsed_fields["target_user"] = user_match.group(1)
                if "Failed password" in line:
                    parsed_fields["status"] = "failed"
                elif "Accepted password" in line:
                    parsed_fields["status"] = "success"
            elif "sudo" in line:
                parsed_fields["daemon"] = "sudo"
                user_match = re.search(r"user=(\w+)", line)
                if user_match:
                    parsed_fields["target_user"] = user_match.group(1)
                if "authentication failure" in line:
                    parsed_fields["status"] = "failed"
                    
    elif log_type == "firewall":
        # Example: 2026-07-02 11:20:10 DROP TCP 203.0.113.5 192.168.1.10 52311 445
        for line in lines:
            if line.startswith("#") or not line.strip():
                continue
            parts = line.split()
            if len(parts) >= 8:
                parsed_fields["action"] = parts[2]
                parsed_fields["protocol"] = parts[3]
                parsed_fields["source_ip"] = parts[4]
                parsed_fields["dest_ip"] = parts[5]
                parsed_fields["source_port"] = parts[6]
                parsed_fields["dest_port"] = parts[7]
                break # Parse first active line
                
    return parsed_fields

# ----------------------------------------------------
# 2. IOC Extractor Tool
# ----------------------------------------------------
@registry.register("ioc_extractor")
def ioc_extractor(raw_log: str) -> Dict[str, List[str]]:
    ip_pattern = r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"
    domain_pattern = r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}\b"
    url_pattern = r"https?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
    hash_pattern = r"\b([a-fA-F0-9]{32}|[a-fA-F0-9]{64})\b"
    
    ips = re.findall(ip_pattern, raw_log)
    domains = re.findall(domain_pattern, raw_log)
    urls = re.findall(url_pattern, raw_log)
    hashes = re.findall(hash_pattern, raw_log)
    
    # De-duplicate while preserving order, and ignore standard system names as domains
    ignore_domains = {"google.com", "aistudio.google.com", "microsoft.com", "sshd", "sudo", "localhost"}
    
    return {
        "ips": list(dict.fromkeys(ips)),
        "domains": [d for d in list(dict.fromkeys(domains)) if d.lower() not in ignore_domains],
        "urls": list(dict.fromkeys(urls)),
        "hashes": list(dict.fromkeys(hashes))
    }

# ----------------------------------------------------
# 3. MITRE Mapper Tool
# ----------------------------------------------------
@registry.register("mitre_mapper")
def mitre_mapper(classification: str, description: str) -> Dict[str, str]:
    keywords = {
        "brute force": {"code": "T1110", "tactic": "Credential Access", "name": "Brute Force"},
        "failed logon": {"code": "T1110", "tactic": "Credential Access", "name": "Brute Force"},
        "ssh": {"code": "T1021.004", "tactic": "Lateral Movement", "name": "Remote Services: SSH"},
        "sudo": {"code": "T1548.003", "tactic": "Privilege Escalation", "name": "Abuse Elevation Control Mechanism: Sudo"},
        "privilege": {"code": "T1078", "tactic": "Defense Evasion", "name": "Valid Accounts"},
        "port scan": {"code": "T1046", "tactic": "Discovery", "name": "Network Service Discovery"},
        "scanning": {"code": "T1046", "tactic": "Discovery", "name": "Network Service Discovery"},
        "drop": {"code": "T1046", "tactic": "Discovery", "name": "Network Service Discovery"},
        "exfiltration": {"code": "T1041", "tactic": "Exfiltration", "name": "Exfiltration Over C2 Channel"}
    }
    
    text = (classification + " " + description).lower()
    for kw, mapping in keywords.items():
        if kw in text:
            return mapping
            
    return {"code": "T1204", "tactic": "Execution", "name": "User Execution"}

# ----------------------------------------------------
# 4. Threat Lookup Tool
# ----------------------------------------------------
@registry.register("threat_lookup")
def threat_lookup(ip: str) -> Dict[str, Any]:
    # Mock Threat Feed database of known malicious IPs
    blacklist = {
        "203.0.113.82": {"reputation": "malicious", "category": "SSH Botnet Scanner", "owner": "Unknown Hosting Provider"},
        "203.0.113.5": {"reputation": "malicious", "category": "Network Recon Sweep", "owner": "Compromised VPS Hosting"},
        "192.168.1.142": {"reputation": "suspicious", "category": "Internal Host Scanning", "owner": "Local Subnet Node"},
        "192.168.1.55": {"reputation": "suspicious", "category": "SSH Login Probing", "owner": "Local Subnet Node"}
    }
    
    if ip in blacklist:
        return {"ip": ip, "blacklisted": True, **blacklist[ip]}
    return {"ip": ip, "blacklisted": False, "reputation": "clean", "category": "None", "owner": "Unknown / Dynamic"}

# ----------------------------------------------------
# 5. URL Analyzer Tool
# ----------------------------------------------------
@registry.register("url_analyzer")
def url_analyzer(url: str) -> Dict[str, Any]:
    suspicious_patterns = [r"login", r"verify", r"update", r"secure", r"bank", r"paypal"]
    is_suspicious = any(re.search(pat, url.lower()) for pat in suspicious_patterns)
    
    # Check for IP logging domain or sketchy TLDs
    sketchy_tlds = [".ru", ".cn", ".xyz", ".top", ".buzz", ".info"]
    has_sketchy_tld = any(url.lower().endswith(tld) or (tld + "/") in url.lower() for tld in sketchy_tlds)
    
    reputation = "clean"
    if has_sketchy_tld:
        reputation = "malicious"
    elif is_suspicious:
        reputation = "suspicious"
        
    return {
        "url": url,
        "is_suspicious": is_suspicious or has_sketchy_tld,
        "reputation": reputation,
        "details": "Sketchy TLD or phishing keyword signature matched." if (is_suspicious or has_sketchy_tld) else "No static indicator signature matched."
    }

# ----------------------------------------------------
# 6. Hash Analyzer Tool
# ----------------------------------------------------
@registry.register("hash_analyzer")
def hash_analyzer(file_hash: str) -> Dict[str, Any]:
    # Mock database of malware file hashes
    malicious_hashes = {
        "44d88612fea8a8f36de82e1278abb02f": {"name": "WannaCry Ransomware", "type": "Ransomware", "threat_level": "CRITICAL"},
        "094fd12f8d3a5aa16f17d42c041e5809167e845a": {"name": "Mimikatz Credential Dumper", "type": "Credential Dumper", "threat_level": "HIGH"},
        "3dc559280adc5f931ade8e25c7b85393842acf30": {"name": "Cobalt Strike Beacon", "type": "Remote Access Trojan", "threat_level": "CRITICAL"}
    }
    
    h = file_hash.lower()
    if h in malicious_hashes:
        return {"hash": file_hash, "known_malware": True, **malicious_hashes[h]}
    return {"hash": file_hash, "known_malware": False, "name": "Unknown file", "type": "N/A", "threat_level": "LOW"}
