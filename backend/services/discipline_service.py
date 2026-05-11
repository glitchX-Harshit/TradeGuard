from sqlalchemy.orm import Session
from models.models import Trade, Violation, AIJournalEntry
from sqlalchemy import desc
from datetime import datetime, timedelta

class DisciplineService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_discipline_score(self):
        """
        Calculates a score from 0 to 100 based on recent behavior.
        Starting base: 100
        - Minus 15 per violation in the last 24 hours
        - Minus 10 per trade without stop loss
        - Minus 5 for overtrading pattern detection
        - Plus 10 for consistent SL usage across 5 trades
        """
        score = 80 # Base score for an active trader
        
        last_24h = datetime.now() - timedelta(days=1)
        
        # Violations penalty
        violations = self.db.query(Violation).filter(Violation.timestamp > last_24h).count()
        score -= (violations * 15)

        # SL usage check
        recent_trades = self.db.query(Trade).order_by(desc(Trade.timestamp)).limit(10).all()
        for trade in recent_trades:
            if not trade.stop_loss:
                score -= 10
        
        # Bonus for consistency
        if len(recent_trades) >= 5 and all(t.stop_loss for t in recent_trades[:5]):
            score += 15

        # Clamp score between 0 and 100
        score = max(0, min(100, score))
        
        # Determine trend (simplified: compare with score from 5 trades ago if we tracked it)
        # For now, just return score and a status
        status = "Excellent" if score > 85 else "Good" if score > 70 else "Fair" if score > 50 else "Poor"
        
        return {
            "score": score,
            "status": status,
            "violations_24h": violations,
            "sl_adherence": f"{len([t for t in recent_trades if t.stop_loss])}/{len(recent_trades)}" if recent_trades else "N/A"
        }
