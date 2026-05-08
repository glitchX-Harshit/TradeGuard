from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from routes import auth, trade, rule, analytics
from utils.mt5_init import initialize_mt5

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TradeGuard AI")

@app.on_event("startup")
def startup_event():
    initialize_mt5()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])
app.include_router(trade.router, tags=["Trade"])
app.include_router(rule.router, tags=["Rule"])
app.include_router(analytics.router, tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "TradeGuard AI API is running."}
