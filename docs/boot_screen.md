# Boot Screen Documentation

Sentinel AI opens with a customized, cyber-themed **Boot Screen** that initializes core services, validates backend connectivity, and provides an immersive retro command-line experience.

## Interface Overview

![Boot Screen Screenshot Placeholder](./assets/boot_screen.png)
*Figure 8: Initial Cyber-Themed Boot and Verification Sequence*

The boot sequence progresses through multiple initialization checks:
1. **System Diagnostics**: Loads internal modules and checks terminal status.
2. **Network Connection Verification**: Pings the configured FastAPI backend endpoint to verify the API is online.
3. **Database Handshake**: Confirms connection to the SQLite/aiosqlite database.
4. **LLM Cognitive Check**: Verifies that the Gemini AI model is responsive.
5. **Interactive UI Synthesis**: Visual scan lines, terminal logs printing, and synthesized voice/audio cues indicating "Sentinel AI System Operational".

---

## Technical Details

- **Skip Function**: Operators can click "BYPASS DIAGNOSTICS" to skip the intro and jump directly to the dashboard.
- **Failures**: If any check fails (e.g., the FastAPI backend is offline), the boot sequence will halt with a red alert warning and block access to the dashboard until the backend is online, ensuring developers can easily debug connection issues on launch.
