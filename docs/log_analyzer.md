# Log Analyzer Documentation

The **Log Analyzer** module in Sentinel AI allows manual log ingestion, parsing verification, and on-demand threat analysis. It serves as the primary gateway for debugging log formats and testing the multi-agent orchestration loop.

## Interface Overview

![Log Analyzer Interface Screenshot Placeholder](./assets/log_analyzer.png)
*Figure 2: Log Analyzer and Manual Ingestion Interface*

The interface consists of:
- **Log Type Selector**: Dropdown to specify log category.
- **Payload Area**: Standard text-area for pasting raw syslog, event log, or JSON lines.
- **Quick Templates**: Shortcuts to load pre-configured templates (e.g., SSH Brute Force, DNS Tunneling, Nmap Port Scan).
- **Submit / Analyze Button**: Triggers the multi-agent pipeline immediately.

---

## Log Ingestion Formats

Sentinel AI supports ingestion and normalization of four primary security log vectors:

### 1. SSH / Auth Log (`linux`)
Used to track system authentication events. Typical patterns include `Failed password for root` or `Invalid user admin`.
- **Example Log**:
  `Jul  6 17:00:21 server sshd[12345]: Failed password for root from 192.168.1.150 port 54322 ssh2`

### 2. Windows Event Log (`windows`)
Supports classic Security Event Log lines targeting authentication and service execution (e.g., Event ID 4625 for failed logins).
- **Example Log**:
  `2026-07-06 17:01:00 Security Audit: Failed Logon. EventID: 4625. Account: Administrator. SourceIP: 198.51.100.12`

### 3. Network Firewall Log (`firewall`)
Logs tracking connections blocked or dropped by edge firewalls. Useful for identifying inbound scans or C2 beacons.
- **Example Log**:
  `Jul  6 17:02:11 FW-Core: BLOCK_INBOUND src=203.0.113.88 dst=10.0.0.5 proto=TCP port=445`

### 4. Nmap XML / Grepable Log (`nmap`)
Captures port-scanning indicators and probing patterns from external reconnaissance scanners.
- **Example Log**:
  `Host: 192.168.1.200 () Ports: 22/closed/tcp//ssh///, 80/open/tcp//http///, 443/open/tcp//https///`
