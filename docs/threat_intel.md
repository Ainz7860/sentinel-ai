# Threat Intelligence Documentation

The **Threat Intelligence Agent** is the cognitive center of Sentinel AI's assessment pipeline. It combines static lookups, local heuristics, and Google Gemini AI models to rate risk levels and map events to global threat frameworks.

## Interface Overview

![Threat Intelligence Panel Screenshot Placeholder](./assets/threat_intel.png)
*Figure 3: Threat Intelligence and Risk Assessment Details*

The Threat Intelligence panel displays:
- **Severity Rating**: Dynamic labels (Low, Medium, High, Critical) based on risk factors.
- **Risk & Confidence Scores**: Numeric gauges (0-100%) indicating event danger and identification confidence.
- **MITRE ATT&CK Mapping**: Direct translation of logs to standardized TTP codes.
- **Explainability Panel**: Plain-text breakdown of why the incident was flagged and the AI's confidence reasoning.

---

## Analysis Engine Details

### 1. Static Lookups
For rapid threat detection without API overhead, the agent queries standard local reputation caches:
- **IP Reputation Check**: Checks the source IP against known malicious, Tor exit nodes, or public proxy lists.
- **Hash Reputation Check**: Cross-references file hashes against simulated signature tables to detect known malware families (e.g., *WannaCry*, *CobaltStrike* beacons).

### 2. MITRE ATT&CK Mapping
The agent automatically matches parsed events to the MITRE Enterprise ATT&CK matrix:
- **Brute Force**: Mapped to **T1110** (Credential Access).
- **DNS Tunneling**: Mapped to **T1071.004** (Command and Control: Application Layer Protocol).
- **Port Scanning**: Mapped to **T1046** (Discovery: Network Service Scanning).
- **Firewall Flooding**: Mapped to **T1498** (Impact: Network Denial of Service).

### 3. Gemini AI Analysis
If configured, the agent forwards the raw logs and pre-parsed variables to the **Gemini API**. Gemini performs semantic reasoning to:
- Identify multi-stage or obfuscated attack vectors.
- Classify new zero-day style payloads.
- Write a human-readable mitigation summary.
