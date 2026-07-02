from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers import auth, incidents, ai, logs

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(ai.router)
app.include_router(logs.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "agent": "Sentinel AI Security Core",
        "version": "1.0.0"
    }
