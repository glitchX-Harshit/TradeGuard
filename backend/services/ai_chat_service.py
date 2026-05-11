import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from models.models import Trade, Violation, BehavioralPattern
from sqlalchemy import desc
from dotenv import load_dotenv

load_dotenv()

class AIChatService:
    def __init__(self, db: Session):
        self.db = db
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def get_coach_response(self, user_query: str):
        if not self.model:
            return "I'm currently in offline mode because the Gemini API key is missing. Please check your .env file."

        # Gather rich context
        recent_trades = self.db.query(Trade).order_by(desc(Trade.timestamp)).limit(20).all()
        recent_violations = self.db.query(Violation).order_by(desc(Violation.timestamp)).limit(10).all()
        latest_patterns = self.db.query(BehavioralPattern).order_by(desc(BehavioralPattern.timestamp)).limit(5).all()

        # Format context for AI
        trade_data = [
            f"Symbol: {t.symbol}, Side: {t.side}, Lot: {t.lot_size}, PnL: {t.pnl}, Status: {t.status}, SL: {'Yes' if t.stop_loss else 'No'}"
            for t in recent_trades
        ]
        violation_data = [f"Type: {v.violation_type}, Reason: {v.reason}" for v in recent_violations]
        pattern_data = [f"Pattern: {p.pattern_type}, Explanation: {p.explanation}" for p in latest_patterns]

        system_prompt = f"""
        You are the 'TradeGuard Behavioral Mentor'. 
        Your voice is a blend of a high-end behavioral psychologist and a firm trading mentor. 
        
        TRADER CONTEXT:
        - History: {trade_data}
        - Violations: {violation_data}
        - Patterns: {pattern_data}
        
        STRICT STYLE GUIDE:
        1. THE "PSYCHOFANCY" TOUCH: Use sophisticated psychological terms (e.g., cognitive dissonance, dopamine loops, emotional friction, neural fatigue) to explain behavior. 
        2. THE "HUMANATIC" TOUCH: Speak like a human who understands the stress of trading, but remains uncompromising on discipline. Avoid robotic coldness.
        3. FORMATTING: 
           - MINIMIZE bolding (stars). Use them only for critical headers.
           - Use simple spacing and clear, short sentences.
           - Don't use bullet points for everything; use elegant, short paragraphs for insights.
        4. STRUCTURE:
           - Start with a direct psychological observation.
           - Explain the "Human Friction" (why the trader is feeling this way).
           - End with a firm, mentor-like directive.
        5. NO GENERIC FLUFF. Every word must carry weight.
        """

        try:
            response = self.model.generate_content([system_prompt, f"User Query: {user_query}"])
            return response.text
        except Exception as e:
            return f"Error connecting to AI Coach: {str(e)}"
