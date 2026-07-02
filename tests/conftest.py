import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport
import os

# Override Database URL for testing using a temporary file-based SQLite database
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_temp.db"

from app.database import Base, get_db
from app.main import app

test_engine = create_async_engine("sqlite+aiosqlite:///./test_temp.db", connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    # Delete test_temp.db if it already exists from a crashed run
    if os.path.exists("./test_temp.db"):
        try:
            os.remove("./test_temp.db")
        except Exception:
            pass

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Teardown: close engine and remove the temporary DB files
    await test_engine.dispose()
    
    if os.path.exists("./test_temp.db"):
        try:
            os.remove("./test_temp.db")
        except Exception:
            pass
    if os.path.exists("./test_temp.db-shm"):
        try:
            os.remove("./test_temp.db-shm")
        except Exception:
            pass
    if os.path.exists("./test_temp.db-wal"):
        try:
            os.remove("./test_temp.db-wal")
        except Exception:
            pass

# Database session override for test client
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
