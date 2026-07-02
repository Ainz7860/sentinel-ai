from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from app.database import get_db
from app.models import ObservabilityMetric, Incident
from app.services.memory_search import memory_search_service

router = APIRouter(prefix="/api/observability", tags=["observability"])
memory_router = APIRouter(prefix="/api/memory", tags=["memory"])

@router.get("/stats")
async def get_observability_stats(db: AsyncSession = Depends(get_db)):
    """
    Aggregates execution latency, token billings, success rates, 
    and invocation frequencies of security agents and tools.
    """
    # 1. Total invocations by agent
    invocations_res = await db.execute(
        select(ObservabilityMetric.agent_name, func.count(ObservabilityMetric.id))
        .where(ObservabilityMetric.event_type == "invocation")
        .group_by(ObservabilityMetric.agent_name)
    )
    invocations = {row[0]: row[1] for row in invocations_res.all()}
    
    # Ensure all agents have a default count
    for agent in ["Security Guardian", "Investigator Agent", "Threat Intelligence Agent", "Response Planner Agent", "Orchestrator"]:
        invocations.setdefault(agent, 0)

    # 2. Tool calls count
    tool_calls_res = await db.execute(
        select(ObservabilityMetric.details, func.count(ObservabilityMetric.id))
        .where(ObservabilityMetric.event_type == "tool_call")
        .group_by(ObservabilityMetric.details)
    )
    tool_calls = sum(row[1] for row in tool_calls_res.all())

    # 3. Average latencies by agent
    latencies_res = await db.execute(
        select(ObservabilityMetric.agent_name, func.avg(ObservabilityMetric.duration_ms))
        .where(ObservabilityMetric.event_type == "invocation")
        .group_by(ObservabilityMetric.agent_name)
    )
    avg_latencies = {row[0]: round(row[1], 1) if row[1] else 0.0 for row in latencies_res.all()}
    for agent in ["Security Guardian", "Investigator Agent", "Threat Intelligence Agent", "Response Planner Agent", "Orchestrator"]:
        avg_latencies.setdefault(agent, 0.0)

    # 4. Success vs Error Counts
    error_res = await db.execute(
        select(func.count(ObservabilityMetric.id))
        .where(ObservabilityMetric.event_type == "error")
    )
    errors = error_res.scalar_one() or 0

    return {
        "agent_invocations": invocations,
        "total_tool_calls": tool_calls,
        "average_latencies_ms": avg_latencies,
        "error_count": errors
    }

@memory_router.get("/search")
async def search_memory(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    """
    Queries past security incidents using TF-IDF text similarity algorithms.
    """
    matches = await memory_search_service.find_similar_incidents(q, db)
    
    results = []
    for inc, score in matches:
        results.append({
            "incident": {
                "id": inc.id,
                "title": inc.title,
                "description": inc.description,
                "severity": inc.severity,
                "status": inc.status,
                "timestamp": inc.timestamp
            },
            "similarity_score": score
        })
    return results
