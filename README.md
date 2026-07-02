# Sentinel AI – Autonomous Cybersecurity Response Agent

Sentinel AI is an autonomous, AI-driven cybersecurity response agent designed for the Kaggle GenAI Capstone project. It monitors security logs, analyzes intrusion signatures, flags anomalies, utilizes Gemini to parse complex security events, and provides playbooks and automated mitigation controls (e.g., firewall configuration updates, user suspension).

## Architecture
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion (animations), Recharts (visualization), React Router.
- **Backend**: FastAPI, SQLAlchemy, aiosqlite (SQLite), Pydantic Settings, google-generativeai (Gemini SDK).
- **Core Engine**: Real-time log parser + LLM threat classifier + Automated action planner.

## Project Structure
- `frontend/` - React SPA with Tailwind CSS dashboard.
- `backend/` - FastAPI backend implementing threat classification and agent logic.
- `sample-data/` - Security log templates (Windows, Linux, firewall, Nmap).
- `docs/` - System architecture and compliance documentation.
- `tests/` - Automated integration and unit tests.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js v20+
- Google AI Studio API Key

### Backend Setup
1. Navigate to `backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\Activate.ps1` (PowerShell) or `venv\Scripts\activate.bat` (CMD)
4. Install dependencies: `pip install -r requirements.txt`
5. Configure `.env` using `.env.example`
6. Run server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Configure `.env`
4. Run dev server: `npm run dev`
