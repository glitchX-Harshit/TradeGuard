import MetaTrader5 as mt5
from datetime import datetime

class MT5Service:
    def __init__(self):
        self.connected = False

    def connect(self, login_id: int, password: str, server: str):
        if not mt5.initialize():
            print("initialize() failed")
            return False
        
        authorized = mt5.login(login_id, password=password, server=server)
        if authorized:
            self.connected = True
            return True
        else:
            print(f"failed to connect at account #{login_id}, error code: {mt5.last_error()}")
            return False

    def disconnect(self):
        mt5.shutdown()
        self.connected = False

    def get_account_info(self):
        if not self.connected:
            return {"balance": 0.0, "equity": 0.0, "margin": 0.0, "profit": 0.0}
        
        account_info = mt5.account_info()
        if account_info != None:
            return account_info._asdict()
        return {"balance": 0.0, "equity": 0.0, "margin": 0.0, "profit": 0.0}

    def get_market_price(self, symbol: str, side: str):
        if not self.connected:
            return 1.1000 # Fallback
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return 1.1000
        return tick.ask if side == "BUY" else tick.bid

    def execute_trade(self, symbol: str, side: str, lot_size: float, sl: float, tp: float):
        if not self.connected:
            return {
                "success": True,
                "ticket": int(datetime.timestamp(datetime.now())),
                "price": 1.1000,
                "message": "Simulated trade execution (MT5 disconnected)"
            }
            
        symbol_info = mt5.symbol_info(symbol)
        if symbol_info is None:
            return {"success": False, "message": f"{symbol} not found"}
        
        if not symbol_info.visible:
            if not mt5.symbol_select(symbol, True):
                return {"success": False, "message": f"{symbol} not found"}
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return {"success": False, "message": "Failed to get market price"}
            
        price = tick.ask if side == "BUY" else tick.bid

        # Dynamically determine the best filling type
        filling_type = mt5.ORDER_FILLING_IOC
        if symbol_info.filling_mode & mt5.SYMBOL_FILLING_FOK:
            filling_type = mt5.ORDER_FILLING_FOK
        elif symbol_info.filling_mode & mt5.SYMBOL_FILLING_IOC:
            filling_type = mt5.ORDER_FILLING_IOC
        else:
            filling_type = mt5.ORDER_FILLING_RETURN
        
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": lot_size,
            "type": mt5.ORDER_TYPE_BUY if side == "BUY" else mt5.ORDER_TYPE_SELL,
            "price": price,
            "sl": round(sl, symbol_info.digits),
            "tp": round(tp, symbol_info.digits),
            "deviation": 20,
            "magic": 234000,
            "comment": "TradeGuard Execution",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": filling_type,
        }
        
        result = mt5.order_send(request)
        if result is None:
            return {"success": False, "message": "No response from MT5"}
            
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return {"success": False, "message": f"Order send failed, retcode={result.retcode} ({result.comment})"}
            
        return {
            "success": True, 
            "ticket": result.order,
            "price": result.price,
            "message": "Trade executed successfully"
        }

mt5_service = MT5Service()
