import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from models.models import Trade, Violation, AIJournalEntry, BehavioralPattern
from sqlalchemy import desc
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

class JournalService:
    def __init__(self, db: Session):
        self.db = db
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def generate_trade_reflection(self, trade_id: int):
        trade = self.db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return None

        if not self.model:
            # Fallback to basic logic if AI is not available
            return self._generate_basic_reflection(trade)

        prompt = f"""
        Psychological Reflection:
        Trade: {trade.symbol} {trade.side} PnL: {trade.pnl}
        Risk Status: {'Stable' if trade.stop_loss else 'Compromised'}
        
        Provide a 1-2 sentence behavioral insight. Use psychological terms. Keep the formatting clean and human.
        """

        try:
            response = self.model.generate_content(prompt)
            content = response.text
        except:
            content = "Trade processed. Maintain discipline."

        reflection = AIJournalEntry(
            entry_type="trade_reflection",
            content=content,
            severity="info" if trade.stop_loss else "critical"
        )
        self.db.add(reflection)
        self.db.commit()
        return reflection

    def generate_daily_summary(self):
        trades = self.db.query(Trade).order_by(desc(Trade.timestamp)).limit(10).all()
        if not trades:
            return None

        if not self.model:
            return None # Or basic summary

        trade_list = [f"{t.symbol} {t.side} PnL:{t.pnl} SL:{'Yes' if t.stop_loss else 'No'}" for t in trades]
        
        prompt = f"""
        Daily Behavioral Brief (1-2 sentences):
        Context: {trade_list}
        
        Identify the core psychological theme of this session. Speak like a mentor. No heavy markdown.
        """

        try:
            response = self.model.generate_content(prompt)
            content = response.text
        except:
            content = "Daily session recorded. Review your performance logs."

        summary = AIJournalEntry(
            entry_type="daily_summary",
            content=content,
            severity="info"
        )
        self.db.add(summary)
        self.db.commit()
        return summary

    def _generate_basic_reflection(self, trade):
        # ... (keep the old logic as a private method for fallback)
        content = f"Trade on {trade.symbol} processed. "
        if not trade.stop_loss:
            content += "CRITICAL: Stop loss was missing."
        reflection = AIJournalEntry(entry_type="trade_reflection", content=content, severity="info")
        self.db.add(reflection)
        self.db.commit()
        return reflection
