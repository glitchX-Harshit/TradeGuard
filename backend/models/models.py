from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    mt5_login = Column(String, unique=True, index=True)
    server = Column(String)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())

class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True, index=True)
    max_trades = Column(Integer, default=5)
    max_daily_loss = Column(Float, default=100.0)
    risk_percentage = Column(Float, default=1.0)
    rr_ratio = Column(Float, default=2.0)
    cooldown_minutes = Column(Integer, default=30)
    max_open_positions = Column(Integer, default=2)
    revenge_trading_block = Column(Boolean, default=True)

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer, unique=True, nullable=True)
    symbol = Column(String, index=True)
    side = Column(String) # BUY or SELL
    lot_size = Column(Float)
    entry_price = Column(Float)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    pnl = Column(Float, default=0.0)
    status = Column(String) # OPEN, CLOSED, REJECTED
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Violation(Base):
    __tablename__ = "violations"
    id = Column(Integer, primary_key=True, index=True)
    violation_type = Column(String)
    reason = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
