from fastapi import FastAPI
from routes import trade_routes, rule_routes

app = FastAPI(
    title="TradeGuard API",
    description="Backend foundation for AI-Driven Trading Discipline System",
    version="1.0.0"
)

# Include Routers
app.include_router(trade_routes.router, tags=["Trades"])
app.include_router(rule_routes.router, tags=["Rules"])

@app.get("/")
def root():
    return {"message": "TradeGuard Backend is running!"}
