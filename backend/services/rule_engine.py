from sqlalchemy.orm import Session
from models import models
from schemas.schemas import TradeExecutionRequest

class RuleEngine:
    def __init__(self, db: Session):
        self.db = db

    def validate_trade(self, req: TradeExecutionRequest) -> dict:
        rule = self.db.query(models.Rule).first()
        if not rule:
            return {"valid": True} # No rules set
            
        # 1. Invalid RR Ratio
        if req.risk_reward_ratio < rule.rr_ratio:
            self._log_violation("Invalid RR Ratio", f"Required RR >= {rule.rr_ratio}, Got {req.risk_reward_ratio}")
            return {"valid": False, "reason": f"Required RR ratio is {rule.rr_ratio}"}
            
        # 2. Max trades per day
        from datetime import datetime, time
        today_start = datetime.combine(datetime.today(), time.min)
        trades_today = self.db.query(models.Trade).filter(models.Trade.timestamp >= today_start).count()
        if trades_today >= rule.max_trades:
            self._log_violation("Overtrading", f"Max trades {rule.max_trades} exceeded")
            return {"valid": False, "reason": f"Max trades per day ({rule.max_trades}) exceeded"}
            
        # 3. Max open positions
        open_trades_count = self.db.query(models.Trade).filter(models.Trade.status == "OPEN").count()
        if open_trades_count >= rule.max_open_positions:
            self._log_violation("Max Positions", f"Max open positions {rule.max_open_positions} reached")
            return {"valid": False, "reason": f"Max open positions ({rule.max_open_positions}) reached"}

        # 4. Cooldown / Revenge Trading Protection
        last_trade = self.db.query(models.Trade).order_by(models.Trade.timestamp.desc()).first()
        if last_trade and rule.revenge_trading_block:
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            time_since_last = now - last_trade.timestamp.replace(tzinfo=None)
            
            # If the last trade was a LOSS (mocking loss check or just checking if closed)
            # For now, let's assume if it was closed recently, we enforce cooldown
            if time_since_last < timedelta(minutes=rule.cooldown_minutes):
                remaining = rule.cooldown_minutes - (time_since_last.seconds // 60)
                self._log_violation("Revenge Trading", f"Cooldown active. {remaining} mins left.")
                return {"valid": False, "reason": f"Revenge Trading Protection! Wait {remaining} more minutes."}

        return {"valid": True}
        
    def _log_violation(self, violation_type: str, reason: str):
        violation = models.Violation(violation_type=violation_type, reason=reason)
        self.db.add(violation)
        self.db.commit()
