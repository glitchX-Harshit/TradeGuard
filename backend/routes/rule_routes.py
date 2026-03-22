from fastapi import APIRouter
from schemas.rule_schema import RuleCreateMsg
from database.db import db

router = APIRouter()

@router.post("/create-rule")
def create_rule(rule: RuleCreateMsg):
    """Updates the global risk parameters."""
    if rule.max_trades_per_day is not None:
        db["rules"]["max_trades_per_day"] = rule.max_trades_per_day
    if rule.max_daily_loss is not None:
        db["rules"]["max_daily_loss"] = rule.max_daily_loss
    
    return {
        "message": "Rules updated successfully", 
        "current_rules": db["rules"]
    }
