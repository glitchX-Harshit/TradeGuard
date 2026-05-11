from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import AIJournalEntry, BehavioralPattern
from services.journal_service import JournalService
from services.behavior_engine import BehaviorEngine
from services.discipline_service import DisciplineService
from services.ai_chat_service import AIChatService
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/journal")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.get("/entries")
def get_entries(db: Session = Depends(get_db)):
    return db.query(AIJournalEntry).order_by(AIJournalEntry.created_at.desc()).limit(50).all()

@router.get("/patterns")
def get_patterns(db: Session = Depends(get_db)):
    return db.query(BehavioralPattern).order_by(BehavioralPattern.timestamp.desc()).limit(10).all()

@router.get("/discipline-score")
def get_discipline_score(db: Session = Depends(get_db)):
    service = DisciplineService(db)
    return service.calculate_discipline_score()

@router.post("/analyze-now")
def run_analysis(db: Session = Depends(get_db)):
    engine = BehaviorEngine(db)
    patterns = engine.analyze_behavior()
    
    journal = JournalService(db)
    journal.generate_daily_summary()
    
    return {"status": "success", "patterns_detected": len(patterns)}

@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, db: Session = Depends(get_db)):
    service = AIChatService(db)
    response_text = service.get_coach_response(request.message)
    return ChatResponse(response=response_text)
