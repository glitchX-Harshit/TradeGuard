from pydantic import BaseModel
from typing import Optional

class TradeRequest(BaseModel):
    symbol: str
    action: str  # e.g., "buy" or "sell"
    volume: float
    stop_loss: float = 0.0
    take_profit: float = 0.0

class TradeResponse(BaseModel):
    status: str
    reason: Optional[str] = None
