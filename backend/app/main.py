from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers import auth, incidents, ai, logs, observability

# Async lifespan context for database creation
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize SQLite tables on application launch
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Sentinel AI - Autonomous Cybersecurity Response Agent Backend",
    description="Cognitive threat log reasoning and response orchestration API.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow development origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory to serve ReportLab generated PDF files
import os
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Register endpoints
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(ai.router)
app.include_router(logs.router)
app.include_router(observability.router)
app.include_router(observability.memory_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "agent": "Sentinel AI Security Core",
        "version": "1.0.0"
    }
