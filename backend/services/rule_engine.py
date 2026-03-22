from database.db import db
from schemas.trade_schema import TradeRequest

def validate_trade(trade_request: TradeRequest) -> dict:
    """
    Basic Rule Engine:
    Validates max trades per day and max daily loss.
    """
    rules = db["rules"]
    stats = db["daily_stats"]

    # Rule 1: Max trades per day
    if stats["trades_today"] >= rules["max_trades_per_day"]:
        return {
            "status": "blocked", 
            "reason": f"Max trades per day ({rules['max_trades_per_day']}) reached."
        }

    # Rule 2: Max daily loss
    # For a real system, we'd check current PnL dynamically. 
    # Here we just mock a check against the daily_stats tracker.
    if stats["loss_today"] >= rules["max_daily_loss"]:
        return {
            "status": "blocked", 
            "reason": f"Max daily loss (${rules['max_daily_loss']}) reached."
        }

    return {"status": "allowed"}

def record_trade(trade_request: TradeRequest):
    """Mock recording an executed trade."""
    db["trades"].append(trade_request.model_dump())
    db["daily_stats"]["trades_today"] += 1
