import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

async def test_root_endpoint(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

async def test_auth_login_success(client: AsyncClient):
    response = await client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "sentinelpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

async def test_auth_login_failure(client: AsyncClient):
    response = await client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrongpassword"}
    )
    assert response.status_code == 401

async def test_get_incidents(client: AsyncClient):
    response = await client.get("/api/incidents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

async def test_analyze_log_success(client: AsyncClient):
    raw_log = "Jul  2 10:14:22 main-server sshd[12042]: Failed password for invalid user admin from 203.0.113.82 port 48212 ssh2"
    response = await client.post(
        "/api/ai/analyze-log",
        json={"log_type": "linux", "raw_log": raw_log}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["threat_detected"] is True
    assert data["severity"] == "CRITICAL"
    assert data["classification"] == "Linux SSH Authentication Brute Force"
    assert "incident" in data
    assert data["incident"]["source_ip"] == "203.0.113.82"
