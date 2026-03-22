from pydantic import BaseModel
from typing import Optional

class RuleCreateMsg(BaseModel):
    max_trades_per_day: Optional[int] = None
    max_daily_loss: Optional[float] = None
