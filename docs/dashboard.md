# Security Dashboard Documentation

The **Sentinel AI Dashboard** provides real-time situational awareness for security operators. It consolidates metrics, feeds, and analytics into a unified single-pane-of-glass interface.

## Interface Overview

![Sentinel AI Dashboard Screenshot Placeholder](./assets/dashboard.png)
*Figure 1: Main Security Operations Dashboard*

The dashboard is structured into three main sections:
1. **Top Metric Cards**: Real-time display of core operational key performance indicators (KPIs).
2. **Analytical Charts**: Visual trends showing attack distributions and security events over time.
3. **Incident Log Feed**: Chronological list of active and mitigated threats.

---

## Metric Cards

- **Total Incidents**: Cumulative count of all threat payloads ingested and processed.
- **Critical Threats**: Total number of high/critical severity incidents (e.g., active brute-force or injection attempts).
- **Auto-Mitigated**: Count of security threats handled autonomously by the Response Planner Agent without manual human approval.
- **Mean Time to Resolution (MTTR)**: Average processing and mitigation latency across all multi-agent pipelines (usually under 2 seconds).

---

## Analytics Panels

### 1. Severity Distribution (Doughnut Chart)
Displays the ratio of **Critical**, **High**, **Medium**, and **Low** severity events. This assists security managers in allocating investigation priority.

### 2. Threat Vector Trends (Bar Chart)
Shows event frequencies categorized by type (e.g., Windows Auth Failures, Linux Intrusion Signatures, Nmap Scans, Firewall Dropped Packets).
