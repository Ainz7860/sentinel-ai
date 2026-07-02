import re

def extract_log_telemetry(raw_log: str) -> dict:
    """
    Utility regex parser to extract IPs, event IDs, and usernames from raw log text
    to assist model context classification.
    """
    ip_pattern = r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"
    ips = re.findall(ip_pattern, raw_log)
    
    # Try finding common user variables
    user_pattern = r"(?:user|account|logon name|name)\s*[:=]?\s*['\"]?([a-zA-Z0-9_\-\$]+)"
    users = re.findall(user_pattern, raw_log, re.IGNORECASE)
    
    # Try finding Windows Event ID
    event_id_pattern = r"EventID\s*=\s*(\d+)"
    event_ids = re.findall(event_id_pattern, raw_log, re.IGNORECASE)
    
    return {
        "source_ip": ips[0] if ips else None,
        "username": users[0] if users else None,
        "event_id": event_ids[0] if event_ids else None
    }
