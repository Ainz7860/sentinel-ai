from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20))  # LOW, MEDIUM, HIGH, CRITICAL
    source_ip: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="UNRESOLVED")  # UNRESOLVED, INVESTIGATING, MITIGATED
    response_action: Mapped[str] = mapped_column(String(50), nullable=True)  # BLOCK_IP, ISOLATE_HOST, etc.
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    
    # Expanded columns for multi-agent capabilities
    mitre_attack: Mapped[str] = mapped_column(String(255), nullable=True)  # e.g. T1110 (Brute Force)
    cve_id: Mapped[str] = mapped_column(String(50), nullable=True)  # e.g. CVE-2024-XXXX
    risk_score: Mapped[int] = mapped_column(Integer, nullable=True)  # 0 to 100
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=True)  # 0 to 100
    attack_timeline: Mapped[str] = mapped_column(Text, nullable=True)  # JSON-encoded array of events
    evidence: Mapped[str] = mapped_column(Text, nullable=True)  # JSON-encoded array of extracted IOCs
    remediation_plan: Mapped[str] = mapped_column(Text, nullable=True)
    pdf_path: Mapped[str] = mapped_column(String(255), nullable=True)

class ResponseRule(Base):
    __tablename__ = "response_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rule_name: Mapped[str] = mapped_column(String(100))
    action_type: Mapped[str] = mapped_column(String(50))  # BLOCK_IP, ISOLATE_HOST
    trigger_severity: Mapped[str] = mapped_column(String(20))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    log_type: Mapped[str] = mapped_column(String(30))  # windows, linux, firewall
    raw_content: Mapped[str] = mapped_column(Text)
    analyzed: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class ObservabilityMetric(Base):
    __tablename__ = "observability_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    agent_name: Mapped[str] = mapped_column(String(50))  # Security Guardian, Investigator, Threat Intel, etc.
    event_type: Mapped[str] = mapped_column(String(50))  # invocation, tool_call, error
    duration_ms: Mapped[int] = mapped_column(Integer)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[str] = mapped_column(Text, nullable=True)
