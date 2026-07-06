# Sentinel AI – Autonomous Cybersecurity Response Agent

<p align="center">
  <img src="./docs/assets/banner_placeholder.png" alt="Sentinel AI Corporate Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />
</p>

<p align="center">
  <strong>Autonomous, multi-agent cognitive threat detection, intrusion analysis, and containment response system.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" alt="Python Badge" />
  <img src="https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Badge" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React Badge" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI Badge" />
  <img src="https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Badge" />
  <img src="https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud Badge" />
  <img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions Badge" />
</p>

---

## 📖 Project Overview

**Sentinel AI** is an advanced autonomous cybersecurity incident response agent created for the **Google × Kaggle GenAI Capstone**. Sentinel AI intercepts security events, parses complex logs, rates threat risk scores, maps attacks to the **MITRE ATT&CK Matrix**, and automatically initiates mitigation playbooks.

By utilizing the cognitive reasoning capabilities of **Google Gemini**, Sentinel AI bridges the gap between raw data ingestion and active network defense. The application is designed to ingest logs from firewalls, operating systems, and network probes, immediately running security assessments and delivering compliance-ready ReportLab PDF summaries.

---

## ✨ Key Features

- **Multi-Agent Collaboration**: Divided cognitive labor between specialized agents (Guardian, Investigator, Threat Intelligence, and Response Planner).
- **Intelligent Log Ingestion**: Support for Linux auth logs, Windows security events, firewall logs, and Nmap probe dumps.
- **MITRE ATT&CK Alignment**: Dynamic mapping of intrusion indicators to standard tactics and techniques (e.g., Brute Force, DNS Tunneling).
- **Autonomous Containment**: Automatic configuration updates for firewalls, user lockouts, and process terminations based on configurable threat thresholds.
- **Explainable AI Insights**: Human-readable explanations detailing why a threat was categorized, helping analysts debug zero-day alerts.
- **Semantic Historical Memory**: Fast correlation database queries to identify persistent threat groups and repetitive intrusion behaviors.
- **Real-Time Observability**: Latency breakdown charts tracking LLM call delays, token expenditures, and cost metrics.
- **PDF Report Compiling**: Automated generation of styled, executive-ready PDF reports on threat containment.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 SPA, Vite 8, Tailwind CSS 4, Framer Motion (micro-animations), Recharts (data visualizations), React Router DOM.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy 2 (asynchronous ORM), aiosqlite (async driver for SQLite), Pydantic Settings, google-generativeai SDK.
- **Reporting Engine**: ReportLab 4.1.0.
- **Deployment**: Docker, Nginx, Google Cloud Run, Google Artifact Registry, Google Secret Manager.

---

## 📐 Architecture Diagrams

### 1. System Architecture
The flowchart below maps the data progression from log files through the backend API, database, Gemini AI engine, and interactive frontend.

```mermaid
graph TD
    subgraph Client ["Client Side (Browser)"]
        A["React SPA (Vite + Tailwind)"]
    end
    subgraph Server ["Server Side (Google Cloud Run)"]
        B["FastAPI Backend App"]
        C[("aiosqlite (SQLite)")]
    end
    subgraph External ["External Services"]
        D["Google Gemini (AI Studio API)"]
    end
    
    A -->|1. Upload Raw Logs / Query Incidents| B
    B -->|2. Check Authentication & Session| B
    B -->|3. Query Memory / Write Logs| C
    B -->|4. Request Cognitive Analysis| D
    D -->|5. Return Mitre ATT&CK & Summary| B
    B -->|6. Compile ReportLab PDF Report| B
    B -->|7. Send Real-Time Incident Status| A
```

### 2. Multi-Agent Flow
Sentinel AI utilizes specialized agents working sequentially to evaluate security events.

```mermaid
graph TD
    RawLog[Raw Security Log] --> Guardian[Security Guardian Agent]
    
    Guardian -->|Validation Safe?| Check{Safe Payload?}
    Check -->|No| Block[Block Payload & Log Attempt]
    Check -->|Yes| Inv[Investigator Agent]
    
    Inv -->|Extract IP, Hashes, Username| Intel[Threat Intelligence Agent]
    Intel -->|Perform Rep Lookups & Gemini Query| Plan[Response Planner Agent]
    Plan -->|Schedule Mitigation Rules & Timeline| DB[(aiosqlite Database)]
```

### 3. User Workflow
The operational workflow for a security analyst interacting with the Sentinel AI dashboard:

```mermaid
graph TD
    Start([Analyst Log In]) --> Boot[Cyber Boot Sequence]
    Boot --> Dash[Access Security Dashboard]
    Dash --> Upload[Paste Raw Log in Log Analyzer]
    Upload --> Run[Trigger Multi-Agent Analysis]
    Run --> Review[Review Threat Level & MITRE ATT&CK Info]
    Review --> Decisions{Auto-Mitigate Enabled?}
    Decisions -->|Yes| Auto[System Automatically Executes Block]
    Decisions -->|No| Manual[Analyst Clicks Resolve/Mitigate]
    Auto --> PDF[Download PDF Compliance Report]
    Manual --> PDF
    PDF --> End([Incident Handled])
```

### 4. Incident Investigation Pipeline
The lifecycle stages of security data during log parsing and threat enrichment:

```mermaid
stateDiagram-v2
    [*] --> Ingestion
    Ingestion --> SecurityCheck : Raw Log Ingested
    SecurityCheck --> IOCExtraction : Payload Validated
    IOCExtraction --> Enrichment : IPs & Hashes Extracted
    Enrichment --> LLMSynthesis : IP Reputation & MITRE mapping
    LLMSynthesis --> ActionPlanning : AI Explanation & Summary
    ActionPlanning --> PDFReporting : Action & Timeline scheduled
    PDFReporting --> [*] : PDF Report Compiled
```

### 5. Application Folder Structure
Logical organization of the repository's folders and modules:

```mermaid
graph TD
    Root[sentinel-ai]
    Root --> backend[backend/]
    Root --> frontend[frontend/]
    Root --> docs[docs/]
    Root --> tests[tests/]
    Root --> sample[sample-data/]
    
    backend --> app[app/]
    app --> routers[routers/]
    app --> services[services/]
    app --> models[models/]
    
    frontend --> src[src/]
    src --> components[components/]
    src --> pages[pages/]
```

### 6. Deployment Architecture
High-availability target architecture on Google Cloud Platform:

```mermaid
graph TD
    subgraph GCP ["Google Cloud Platform (lexical-tide-499609-j1)"]
        subgraph Registry ["Google Artifact Registry"]
            BEImg[Backend Container Image]
            FEImg[Frontend Container Image]
        end
        subgraph Secrets ["Google Secret Manager"]
            GeminiKey[GEMINI_API_KEY Secret]
        end
        subgraph Runtime ["Serverless Runtime"]
            FECnt[Cloud Run: Frontend Service]
            BECnt[Cloud Run: Backend Service]
        end
    end
    
    Developer[Developer] -->|git push / gcloud builds| Registry
    BECnt -->|Read Secret| GeminiKey
    FECnt -->|CORS API Requests| BECnt
    FECnt <--|Serves Web Client| Browser([Browser Client])
    BECnt -->|Cognitive Call| GeminiExternal([Google Gemini AI Studio])
```

### 7. Request Flow
Sequential request routing when an analyst triggers a manual log analysis:

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Security Operator
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant AG as Multi-Agent Core
    participant DB as SQLite DB
    participant AI as Gemini API

    Analyst->>FE: Ingest raw logs (Click Submit)
    FE->>BE: POST /api/logs/parse (Raw Payload)
    BE->>AG: Process Log (Orchestrator)
    AG->>AG: 1. Security Guardian validates payload
    AG->>AG: 2. Investigator extracts IPs/Hashes
    AG->>AI: 3. Threat Intel requests summary (if key available)
    AI-->>AG: Returns Mitigation reasoning & Mitre mapping
    AG->>AG: 4. Response Planner plans actions
    AG->>DB: 5. Store Incident & logs metrics
    AG->>BE: 6. Trigger PDFReportGenerator
    BE->>DB: Update Incident with PDF path
    BE-->>FE: Return parsed response JSON (success)
    FE-->>Analyst: Show Dashboard updates & PDF Link
```

### 8. Authentication Flow
Security sequence to log in and access protected dashboard features:

```mermaid
sequenceDiagram
    autonumber
    actor User as Operator
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant DB as SQLite Database

    User->>FE: Input username & password
    FE->>BE: POST /api/auth/login
    BE->>BE: Compare against ADMIN_USERNAME & ADMIN_PASSWORD env
    alt Valid Credentials
        BE->>FE: Return JWT access_token (bearer)
        FE->>FE: Store token in Local Storage
        FE->>User: Route to Dashboard page
    else Invalid Credentials
        BE-->>FE: Return HTTP 401 Unauthorized
        FE->>User: Display login error message
    end
```

### 9. Memory Flow
Retrieving and injecting historical event context into current threat analysis:

```mermaid
graph TD
    NewEvent[New Ingested Event] --> ExtIP[Extract Source IP & Hashes]
    ExtIP --> MemSearch[Search Database for matching Source IP / Hashes]
    MemSearch --> MatchExists{Matches Found?}
    MatchExists -->|Yes| LoadPast[Load Past Incidents & Remediation Plans]
    LoadPast --> InjectPrompt[Inject Past History into Gemini Prompt]
    MatchExists -->|No| Isolation[Execute Standard Analysis Flow]
    InjectPrompt --> LLMCall[Call Gemini AI]
    Isolation --> LLMCall
    LLMCall --> SaveEvent[Save Current Incident & Add to Memory Cache]
```

### 10. Report Generation Flow
Executing the ReportLab compiling engine to output audit compliance documents:

```mermaid
graph TD
    IncLogged[Incident Saved to Database] --> TrgPdf[Trigger PDF Generator]
    TrgPdf --> FetchData[Fetch Incident Details, Extracted IOCs & Timeline]
    FetchData --> BuildCanvas[Initialize ReportLab SimpleDocTemplate]
    BuildCanvas --> AddHeader[Draw Corporate Deep-Blue Header Banner]
    AddHeader --> AddMetadata[Write Incident ID, Severity & MITRE Code]
    AddMetadata --> AddEvidence[Insert Raw Log Event & Extracted IOCs Table]
    AddEvidence --> AddTimeline[Draw Recommended Remediation Action Table]
    AddTimeline --> BuildPdf[Build and Save PDF in static/reports/]
    BuildPdf --> ReturnPath[Update Database Record with Download URL]
```

---

## 📂 Folder Structure

```
sentinel-ai/
├── .github/workflows/       # GitHub Actions CI Configurations
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy Database Schemas
│   │   ├── routers/         # API Routing (Incidents, Auth, Logs, Observability)
│   │   ├── services/        # Multi-Agent Logic & Utilities
│   │   ├── config.py        # Pydantic Configuration Loader
│   │   ├── database.py      # SQLAlchemy Session Initialization
│   │   └── main.py          # FastAPI Core Setup
│   ├── static/reports/      # Output PDFs (Ignored by VCS)
│   ├── Dockerfile           # Backend Container Definition
│   └── requirements.txt     # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Blocks (Metric Cards, AI Chat Widget)
│   │   └── pages/           # Pages (Dashboard, Settings, Observability)
│   ├── Dockerfile           # Frontend Container Definition
│   └── nginx.conf           # Production Nginx Proxy Config
├── docs/                    # Deep-dive Module Documentation
├── sample-data/             # Ingestion Log Templates
├── tests/                   # Automated Pytest Suite
├── docker-compose.yml       # Local Development Orchestration Script
└── DEPLOYMENT.md            # GCP Deployment Playbook
```

---

## 🚀 Installation & Local Setup

### Prerequisites

- **Python 3.11+**
- **Node.js v20+**
- **Google AI Studio API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Environment Configuration

#### Backend Env
Create a `.env` file inside the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./sentinel.db
JWT_SECRET=supersecretjwtsecretkeysentinelai12345
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sentinelpass123
```

#### Frontend Env
Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

### 2. Local Setup (Without Docker)

#### Running the Backend
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 3. Local Setup (With Docker Compose)

To start both the frontend and backend containerized and linked automatically:
```bash
docker compose up --build
```
Open `http://localhost:3000` to view the web client.

---

### 4. Running Automated Tests

To run the backend FastAPI test suite:
```bash
cd backend
pytest
```

---

## ☁️ Deployment Instructions

The project is pre-configured for deployment on Google Cloud Platform.
Detailed instructions for setting up Google Artifact Registry, building containers via Cloud Build, configuring Secret Manager, and deploying to **Google Cloud Run** are available in [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🔮 Future Improvements

- **Production Cloud SQL Database Integration**: Migrating database layers to highly resilient PostgreSQL instances.
- **Log Streaming Connectors**: Direct integrations with cloud logging pipelines (AWS CloudWatch, Google Cloud Logging, Splunk).
- **Advanced Vector Memory**: Utilizing pgvector or Vertex AI Vector Search for ultra-fast security vector retrieval.
- **Two-Factor Authentication (2FA)**: Restricting operator control and mitigation execution behind biometric or TOTP secondary tokens.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Acknowledgements

- Google Generative AI Team for the Gemini API.
- Kaggle Capstone Organizers for the GenAI Cyber Response challenge.
- The open-source security community for compiling standard IOC signatures.
