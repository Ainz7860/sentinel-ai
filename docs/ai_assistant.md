# AI Assistant Documentation

The **Sentinel AI Assistant** is a persistent, interactive chatbot widget that assists operators with threat intelligence querying, playbook suggestions, and log investigations.

## Interface Overview

![AI Assistant Panel Screenshot Placeholder](./assets/ai_assistant.png)
*Figure 9: Floating AI Assistant Chat Window*

The assistant features:
- **Floating Chat Trigger**: Bottom-right icon that toggles the chat interface.
- **Predefined Queries**: Speed buttons to ask common security questions (e.g., "Explain last MITRE attack", "Show mitigated threats", "Check system status").
- **Custom Input Field**: Text box for typing freeform questions about incidents or threat mitigation tactics.
- **Scrollable Chat Log**: Clear, chat-bubble formatted list of conversations between the operator and the Sentinel AI Core.

---

## Capabilities

The chatbot connects directly to the backend Gemini AI engine. When an operator asks a question, the assistant:
1. Pulls historical incident logs from the database.
2. Extracts related IOC context.
3. Formulates a comprehensive response using generative security intelligence, explaining complex cyber attack patterns (e.g., explaining why a DNS tunneling attempt is dangerous) in simple, actionable terms.
