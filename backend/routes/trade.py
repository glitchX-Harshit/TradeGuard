from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from schemas import schemas
from database.database import get_db
from models import models
from services.mt5_service import mt5_service
from services.rule_engine import RuleEngine

router = APIRouter()

@router.post("/execute-trade", response_model=schemas.TradeResponse)
def execute_trade(req: schemas.TradeExecutionRequest, db: Session = Depends(get_db)):
    rule_engine = RuleEngine(db)
    validation = rule_engine.validate_trade(req)
    
    if not validation["valid"]:
        trade = models.Trade(
            symbol=req.symbol,
            side=req.order_type,
            lot_size=req.lot_size,
            entry_price=0.0,
            stop_loss=req.stop_loss_pips,
            take_profit=0.0,
            status="REJECTED",
        )
        db.add(trade)
        db.commit()
        db.refresh(trade)
        raise HTTPException(status_code=400, detail=validation["reason"])
    
    current_price = mt5_service.get_market_price(req.symbol, req.order_type)
    
    pips_val = req.stop_loss_pips * 0.0001
    tp_pips_val = (req.stop_loss_pips * req.risk_reward_ratio) * 0.0001
    
    if req.order_type == "BUY":
        sl_price = current_price - pips_val
        tp_price = current_price + tp_pips_val
    else:
        sl_price = current_price + pips_val
        tp_price = current_price - tp_pips_val
        
    result = mt5_service.execute_trade(req.symbol, req.order_type, req.lot_size, sl_price, tp_price)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
        
    trade = models.Trade(
        ticket=result.get("ticket"),
        symbol=req.symbol,
        side=req.order_type,
        lot_size=req.lot_size,
        entry_price=result.get("price", current_price),
        stop_loss=sl_price,
        take_profit=tp_price,
        status="OPEN"
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    
    return trade

@router.get("/trade-history", response_model=List[schemas.TradeResponse])
def trade_history(db: Session = Depends(get_db)):
    return db.query(models.Trade).order_by(models.Trade.timestamp.desc()).all()

@router.get("/open-trades", response_model=List[schemas.TradeResponse])
def open_trades(db: Session = Depends(get_db)):
    return db.query(models.Trade).filter(models.Trade.status == "OPEN").all()
