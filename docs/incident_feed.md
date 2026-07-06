# Incident Feed & PDF Reports Documentation

The **Incident Feed** displays the historical and active timeline of threat events processed by Sentinel AI. It serves as the primary system of record for incident response reviews, and compiles formal compliance reports via ReportLab.

## Interface Overview

![Incident Feed Screenshot Placeholder](./assets/incident_feed.png)
*Figure 4: Incident Feed and Management Panel*

The feed contains:
- **Severity Badges**: Colored labels for rapid visual filtering.
- **Remediation Dialog**: Pop-up detailing the step-by-step mitigation timeline.
- **Incident PDF Link**: One-click download button for executive reports.
- **Resolve Button**: Allows operators to manually update incident status to "RESOLVED" once containment rules are updated.

---

## Mitigation & Remediation Timeline

For every incident, the **Response Planner Agent** computes a customized containment timeline:
1. **T0 (Immediate)**: IP blocking / Firewall rule updates.
2. **T+5m**: Local user lockout and credential revocation.
3. **T+15m**: Malicious process terminations.
4. **T+1h**: Formal security post-mortem and compliance audit scheduling.

---

## Executive PDF Reports (ReportLab)

When an incident is logged in the database, the **PDFReportGenerator** compiled via ReportLab dynamically builds a professional PDF. 

- **Storage Location**: Saved locally in the `backend/static/reports/` folder.
- **Download Route**: Accessible via standard FastAPI static mounts (`/static/reports/incident_<id>_report.pdf`).
- **Report Elements**:
  - Deep-blue color-coordinated corporate layout.
  - Mitre ATT&CK and CVE reference mappings.
  - Raw evidence dump (extracted IOCs, IPs, hashes).
  - Remediation timeline and security signature validation tags.
