from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import schemas
from database.database import get_db
from models import models

router = APIRouter()

@router.post("/create-rule", response_model=schemas.RuleResponse)
def create_rule(req: schemas.RuleCreate, db: Session = Depends(get_db)):
    rule = db.query(models.Rule).first()
    if rule:
        rule.max_trades = req.max_trades
        rule.max_daily_loss = req.max_daily_loss
        rule.risk_percentage = req.risk_percentage
        rule.rr_ratio = req.rr_ratio
        rule.cooldown_minutes = req.cooldown_minutes
        rule.max_open_positions = req.max_open_positions
        rule.revenge_trading_block = req.revenge_trading_block
    else:
        rule = models.Rule(
            max_trades=req.max_trades,
            max_daily_loss=req.max_daily_loss,
            risk_percentage=req.risk_percentage,
            rr_ratio=req.rr_ratio,
            cooldown_minutes=req.cooldown_minutes,
            max_open_positions=req.max_open_positions,
            revenge_trading_block=req.revenge_trading_block
        )
        db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/rules", response_model=schemas.RuleResponse)
def get_rules(db: Session = Depends(get_db)):
    rule = db.query(models.Rule).first()
    if not rule:
        rule = models.Rule(
            max_trades=5,
            max_daily_loss=100.0,
            risk_percentage=1.0,
            rr_ratio=2.0,
            cooldown_minutes=30,
            max_open_positions=2,
            revenge_trading_block=True
        )
        db.add(rule)
        db.commit()
        db.refresh(rule)
    return rule

@router.post("/reset-governance")
def reset_governance(db: Session = Depends(get_db)):
    # Clear all violations
    db.query(models.Violation).delete()
    # Clear all trade history to reset daily limits
    db.query(models.Trade).delete()
    db.commit()
    return {"message": "Governance and trade limits have been reset successfully."}
