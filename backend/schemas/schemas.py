from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MT5LoginInfo(BaseModel):
    login_id: int
    password: str
    server: str

class TradeExecutionRequest(BaseModel):
    symbol: str
    order_type: str
    lot_size: float
    risk_reward_ratio: float
    stop_loss_pips: float

class RuleCreate(BaseModel):
    max_trades: int
    max_daily_loss: float
    risk_percentage: float
    rr_ratio: float
    cooldown_minutes: int
    max_open_positions: int
    revenge_trading_block: bool

class RuleResponse(RuleCreate):
    id: int
    class Config:
        from_attributes = True

class TradeResponse(BaseModel):
    id: int
    ticket: Optional[int] = None
    symbol: str
    side: str
    lot_size: float
    entry_price: float
    stop_loss: float
    take_profit: float
    pnl: float
    status: str
    timestamp: datetime
    class Config:
        from_attributes = True

class ViolationResponse(BaseModel):
    id: int
    violation_type: str
    reason: str
    timestamp: datetime
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    balance: float
    equity: float
    margin: float
    profit: float
    open_trades_count: int
    violations_count: int
    discipline_score: float
