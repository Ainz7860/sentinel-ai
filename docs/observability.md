# Observability & Metrics Documentation

The **Observability** dashboard provides operations managers and DevOps engineers with visibility into agent performance, latency, and estimated token execution costs.

## Interface Overview

![Observability Interface Screenshot Placeholder](./assets/observability.png)
*Figure 6: Observability Analytics and Metrics Panel*

The Observability panel consists of three major dashboards:
1. **Agent Invocation Logs**: Timestamps, names, and durations (ms) of individual agent invocations (Security Guardian, Investigator, Threat Intel, Response Planner).
2. **Latency Breakdown (Timeline Chart)**: Linear chart showing which agent steps take the longest, exposing bottlenecks in LLM requests.
3. **LLM Token & Cost Tracker**: Running estimate of Gemini API costs based on token sizes and call frequencies.

---

## Metric Tracking Fields

- **duration_ms**: The time elapsed during agent execution. Security Guardian (heuristics-based) typically runs in <10ms, whereas LLM-based Threat Intelligence calls range from 800ms to 2.5 seconds.
- **event_type**: Category of event (typically `invocation`).
- **details**: Metadata logs detailing specific actions (e.g., "Extracted 2 IPs", "Mitigation plan scheduled").

---

## Cost Computation

Vite frontend calculates estimated AI spend based on typical rates:
- **Input Tokens**: Estimated base rate per 1,000 input tokens.
- **Output Tokens**: Estimated base rate per 1,000 output tokens.
- This ensures operators can monitor usage trends and prevent cost overruns in production environments.
