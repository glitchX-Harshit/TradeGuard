import os
from dotenv import load_dotenv
from services.mt5_service import mt5_service

load_dotenv()

MT5_LOGIN = os.getenv("MT5_LOGIN")
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "")
MT5_SERVER = os.getenv("MT5_SERVER", "")

def initialize_mt5():
    if not MT5_LOGIN or not str(MT5_LOGIN).isdigit():
        print("MT5_LOGIN is invalid or still using placeholder. Skipping MT5 connection.")
        return False
    
    return mt5_service.connect(int(MT5_LOGIN), password=MT5_PASSWORD, server=MT5_SERVER)
