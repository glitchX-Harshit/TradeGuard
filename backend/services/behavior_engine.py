from sqlalchemy.orm import Session
from models.models import Trade, Violation, BehavioralPattern
from sqlalchemy import desc
from datetime import datetime, timedelta

class BehaviorEngine:
    def __init__(self, db: Session):
        self.db = db

    def analyze_behavior(self):
        # Fetch recent trades and violations
        recent_trades = self.db.query(Trade).order_by(desc(Trade.timestamp)).limit(50).all()
        recent_violations = self.db.query(Violation).order_by(desc(Violation.timestamp)).limit(20).all()

        patterns = []

        # 1. Overtrading Detection
        # Criteria: too many trades in short time (e.g., > 5 trades in 1 hour)
        one_hour_ago = datetime.now() - timedelta(hours=1)
        trades_last_hour = [t for t in recent_trades if t.timestamp > one_hour_ago]
        if len(trades_last_hour) >= 5:
            patterns.append(BehavioralPattern(
                pattern_type="overtrading",
                confidence=0.8,
                explanation=f"Detected {len(trades_last_hour)} trades in the last hour. This indicates high frequency trading which might lead to fatigue and poor decision making.",
                recommendation="Take a 30-minute break. Step away from the screens to regain objectivity."
            ))

        # 2. Revenge Trading Detection
        # Criteria: frequent entries after losses, or increased lot size after a loss
        last_3_trades = recent_trades[:3]
        if len(last_3_trades) >= 2:
            if last_3_trades[1].pnl < 0: # Previous trade was a loss
                time_diff = last_3_trades[0].timestamp - last_3_trades[1].timestamp
                if time_diff.total_seconds() < 300: # Less than 5 minutes between trades
                    patterns.append(BehavioralPattern(
                        pattern_type="revenge_trading",
                        confidence=0.9,
                        explanation="Entered a new trade very quickly after a loss. This pattern often indicates an emotional response to 'win back' losses.",
                        recommendation="Implement a mandatory 15-minute cooldown after any loss."
                    ))

        # 3. Poor Risk Management
        # Criteria: SL missing or RR ratio too low
        trades_with_low_rr = [t for t in recent_trades if t.take_profit and t.stop_loss and abs(t.take_profit - t.entry_price) / (abs(t.stop_loss - t.entry_price) or 1) < 1.0]
        if trades_with_low_rr:
            patterns.append(BehavioralPattern(
                pattern_type="poor_risk_management",
                confidence=0.7,
                explanation="Multiple trades have a Reward-to-Risk ratio below 1.0. This makes long-term profitability mathematically difficult.",
                recommendation="Only enter trades where the potential reward is at least 2x the risk."
            ))

        # 4. Impulsive Behavior
        # Criteria: multiple rule violations or random symbol switching
        if len(recent_violations) >= 3:
            patterns.append(BehavioralPattern(
                pattern_type="impulsive_behavior",
                confidence=0.85,
                explanation="Frequent rule violations detected recently. This suggests a lack of discipline and impulsive execution.",
                recommendation="Re-read your trading plan before every single entry. Check off your rules manually."
            ))

        # Save new patterns (avoiding duplicates if possible or just adding new ones)
        # For simplicity, we just add them
        for pattern in patterns:
            self.db.add(pattern)
        
        self.db.commit()
        return patterns
