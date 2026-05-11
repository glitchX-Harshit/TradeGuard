from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import MetaTrader5 as mt5
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
    pip_size = mt5_service.calculate_pip_value(req.symbol)
    
    sl_distance = req.stop_loss_pips * pip_size
    tp_distance = (req.stop_loss_pips * req.risk_reward_ratio) * pip_size
    
    if req.order_type == "BUY":
        sl_price = current_price - sl_distance
        tp_price = current_price + tp_distance
    else:
        sl_price = current_price + sl_distance
        tp_price = current_price - tp_distance
    
    # Final normalization before sending to execution
    sl_price = mt5_service.normalize_price(req.symbol, sl_price)
    tp_price = mt5_service.normalize_price(req.symbol, tp_price)
        
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

@router.get("/symbol-info/{symbol}")
def get_symbol_info(symbol: str):
    if not mt5_service.connected:
        return {
            "price": 1.1000,
            "digits": 5,
            "pip_size": 0.0001,
            "tick_size": 0.00001
        }
    
    info = mt5_service.get_symbol_info(symbol)
    if not info:
        raise HTTPException(status_code=404, detail="Symbol not found")
    
    tick = mt5.symbol_info_tick(symbol)
    price = tick.ask if tick else 1.1000
    
    return {
        "price": price,
        "digits": info.digits,
        "pip_size": mt5_service.calculate_pip_value(symbol),
        "tick_size": info.trade_tick_size
    }

@router.post("/close-trade/{ticket}")
def close_trade(ticket: int, db: Session = Depends(get_db)):
    # 1. Close in MT5
    result = mt5_service.close_trade(ticket)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    # 2. Update in DB
    trade = db.query(models.Trade).filter(models.Trade.ticket == ticket).first()
    if trade:
        trade.status = "CLOSED"
        trade.exit_price = result.get("price", 0.0) # We might want to get the actual exit price from result
        db.commit()
    
    return result
