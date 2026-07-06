# System Settings Documentation

The **Settings Panel** manages system integrations, API URLs, model parameters, and autonomous response guidelines. It allows operators to customize Sentinel AI's behavioral thresholds.

## Interface Overview

![Settings Panel Screenshot Placeholder](./assets/settings.png)
*Figure 7: System Settings and Policy Management Panel*

The settings are categorized into three blocks:
1. **Backend Endpoints**: Specifies the FastAPI API base URL (defaults to `http://localhost:8000`).
2. **Gemini Reasoner Configuration**: Manages Gemini API integration, including Model Selection (`gemini-2.5-flash` or `gemini-2.5-pro`).
3. **Autonomous Mitigation Policies**: Toggles for direct API interaction without manual human-in-the-loop validation.

---

## Autonomous Mitigation Policy Details

When **Enable Real-time Auto-Mitigate** is checked, the system skips manual approval states for events meeting or exceeding the chosen **Severity Threshold**:
- **Critical Threats Only**: Only triggers actions (like user lockout or network blocking) if risk scores exceed 90.
- **High & Critical Threats**: Auto-mitigates threats rated High or Critical (risk score > 75).
- **Medium & Above**: Auto-mitigates threats rated Medium, High, or Critical (risk score > 40).

---

## Secure API Key Binding

In production environments, the Gemini API key should be bound to the environment using Google Secret Manager (as explained in [DEPLOYMENT.md](../DEPLOYMENT.md)), while local settings are configured in the `.env` file of the backend.
