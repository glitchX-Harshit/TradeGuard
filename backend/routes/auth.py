from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import schemas
from database.database import get_db
from services.mt5_service import mt5_service
from models import models

router = APIRouter()

@router.post("/connect-mt5")
def connect_mt5(login_info: schemas.MT5LoginInfo, db: Session = Depends(get_db)):
    success = mt5_service.connect(login_info.login_id, login_info.password, login_info.server)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to connect to MT5")
    
    user = db.query(models.User).filter(models.User.mt5_login == str(login_info.login_id)).first()
    if not user:
        user = models.User(mt5_login=str(login_info.login_id), server=login_info.server)
        db.add(user)
    else:
        user.server = login_info.server
    db.commit()
    
    return {"message": "Successfully connected to MT5"}
