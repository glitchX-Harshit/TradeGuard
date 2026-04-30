# In-memory mock database
# In a real app, this would connect to PostgreSQL or similar.

db = {
    "rules": {
        "max_trades_per_day": 5,
        "max_daily_loss": 100.0,
    },
    "trades": [],
    "daily_stats": {
        "trades_today": 0,
        "loss_today": 0.0
    }
}


