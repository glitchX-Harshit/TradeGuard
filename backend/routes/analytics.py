from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas import schemas
from database.database import get_db
from models import models
from services.mt5_service import mt5_service

router = APIRouter()

@router.get("/dashboard-summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    account_info = mt5_service.get_account_info()
    
    balance = account_info.get("balance", 0.0)
    equity = account_info.get("equity", 0.0)
    margin = account_info.get("margin", 0.0)
    profit = account_info.get("profit", 0.0)
    
    open_trades = db.query(models.Trade).filter(models.Trade.status == "OPEN").count()
    violations = db.query(models.Violation).count()
    
    total_trades = db.query(models.Trade).count()
    if total_trades == 0:
        score = 100.0
    else:
        score = max(0.0, 100.0 - (violations / max(1, total_trades) * 20)) 
        
    return {
        "balance": balance,
        "equity": equity,
        "margin": margin,
        "profit": profit,
        "open_trades_count": open_trades,
        "violations_count": violations,
        "discipline_score": round(score, 2)
    }

@router.get("/violations", response_model=List[schemas.ViolationResponse])
def get_violations(db: Session = Depends(get_db)):
    return db.query(models.Violation).order_by(models.Violation.timestamp.desc()).all()
