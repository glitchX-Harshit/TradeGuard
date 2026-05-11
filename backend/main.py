from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from database.database import engine, Base
from routes import auth, trade, rule, analytics, journal
from utils.mt5_init import initialize_mt5

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    initialize_mt5()
    yield
    # Shutdown logic (if any)

app = FastAPI(title="TradeGuard AI", lifespan=lifespan)

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
app.include_router(journal.router, tags=["Journal"])

@app.get("/")
def root():
    return {"message": "TradeGuard AI API is running."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
