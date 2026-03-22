from fastapi import APIRouter
from schemas.trade_schema import TradeRequest, TradeResponse
from services.rule_engine import validate_trade, record_trade
from database.db import db

router = APIRouter()

@router.post("/execute-trade", response_model=TradeResponse)
def execute_trade(trade: TradeRequest):
    """
    Validates a trade against the rule engine.
    If allowed, it effectively 'executes' it (mocked).
    """
    # 1. Validate the trade
    validation_result = validate_trade(trade)
    
    if validation_result["status"] == "blocked":
        return TradeResponse(
            status="blocked", 
            reason=validation_result["reason"]
        )
    
    # 2. Proceed to execute via MT5 (Placeholder)
    # from services.mt5_service import execute_mt5_order
    # execute_mt5_order(trade.model_dump())

    # 3. Record the trade
    record_trade(trade)
    
    return TradeResponse(
        status="allowed", 
        reason="Trade executed successfully"
    )

@router.get("/trade-history")
def get_trade_history():
    """Returns the mock trade history."""
    return {
        "total_trades": len(db["trades"]), 
        "trades": db["trades"],
        "daily_stats": db["daily_stats"]
    }
