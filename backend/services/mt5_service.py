try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None
    print("MetaTrader5 library not found. Running in simulation mode (Linux/Deployment).")
from datetime import datetime

class MT5Service:
    def __init__(self):
        self.connected = False

    def connect(self, login_id: int, password: str, server: str):
        if mt5 is None:
            print("MT5 library not available. Simulations enabled.")
            self.connected = True
            return True

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
        if mt5 is not None:
            mt5.shutdown()
        self.connected = False

    def get_account_info(self):
        if not self.connected or mt5 is None:
            return {"balance": 100000.0, "equity": 100000.0, "margin": 0.0, "profit": 0.0}
        
        account_info = mt5.account_info()
        if account_info != None:
            return account_info._asdict()
        return {"balance": 0.0, "equity": 0.0, "margin": 0.0, "profit": 0.0}

    def get_market_price(self, symbol: str, side: str):
        if not self.connected or mt5 is None:
            return 1.1000
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return 1.1000
        return tick.ask if side == "BUY" else tick.bid

    def get_symbol_info(self, symbol: str):
        if not self.connected or mt5 is None:
            return None
        return mt5.symbol_info(symbol)

    def calculate_pip_value(self, symbol: str):
        info = self.get_symbol_info(symbol)
        if not info:
            return 0.0001
        
        # Quant-Grade Pip Detection Logic:
        # 1. Handle JPY pairs (usually 3 or 2 digits)
        if "JPY" in symbol.upper():
            return 0.01
            
        # 2. Handle Metals (XAU, XAG)
        # Gold often has 2 digits. 1 pip is usually 0.1 (10 points)
        if any(metal in symbol.upper() for metal in ["XAU", "XAG", "GOLD", "SILVER"]):
            if info.digits == 2: return 0.1
            if info.digits == 3: return 0.1
            return info.point * 10

        # 3. Handle Forex (5 or 4 digits)
        if info.digits >= 4:
            return 0.0001
            
        # 4. Handle Indices / Crypto / Others
        # Fallback to 10 * point if point is very small, else use point
        if info.point < 0.0001:
            return info.point * 10
        return info.point

    def normalize_price(self, symbol: str, price: float):
        info = self.get_symbol_info(symbol)
        if not info:
            return round(price, 5)
        
        # Round to symbol digits
        rounded_price = round(price, info.digits)
        
        # Align with tick size
        if info.trade_tick_size > 0:
            rounded_price = round(rounded_price / info.trade_tick_size) * info.trade_tick_size
            
        return round(rounded_price, info.digits)

    def execute_trade(self, symbol: str, side: str, lot_size: float, sl: float, tp: float):
        if not self.connected or mt5 is None:
            return {
                "success": True,
                "ticket": int(datetime.timestamp(datetime.now())),
                "price": 1.1000,
                "message": "Simulated trade execution (MT5 disconnected or library missing)"
            }
            
        symbol_info = self.get_symbol_info(symbol)
        if symbol_info is None:
            return {"success": False, "message": f"{symbol} not found"}
        
        if not symbol_info.visible:
            if not mt5.symbol_select(symbol, True):
                return {"success": False, "message": f"{symbol} not found"}
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return {"success": False, "message": "Failed to get market price"}
            
        price = tick.ask if side == "BUY" else tick.bid
        
        print(f"DEBUG: {symbol} | Digits: {symbol_info.digits} | Point: {symbol_info.point} | Tick Size: {symbol_info.trade_tick_size}")
        print(f"DEBUG: Calculated Pip Value: {self.calculate_pip_value(symbol)}")

        # Normalize SL and TP
        sl = self.normalize_price(symbol, sl)
        tp = self.normalize_price(symbol, tp)
        
        print(f"DEBUG: Side: {side} | Entry: {price} | SL: {sl} | TP: {tp}")
        
        # Broker Validation: Minimum Stop Distance
        stops_level = symbol_info.trade_stops_level * symbol_info.point
        if stops_level > 0:
            if side == "BUY":
                if sl > price - stops_level:
                    return {"success": False, "message": f"SL too close to price. Min distance: {symbol_info.trade_stops_level} points"}
            else:
                if sl < price + stops_level:
                    return {"success": False, "message": f"SL too close to price. Min distance: {symbol_info.trade_stops_level} points"}

        # Filling Mode logic
        filling_mode = symbol_info.filling_mode
        if filling_mode & 1:
            filling_type = mt5.ORDER_FILLING_FOK
        elif filling_mode & 2:
            filling_type = mt5.ORDER_FILLING_IOC
        else:
            filling_type = mt5.ORDER_FILLING_RETURN
        
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": lot_size,
            "type": mt5.ORDER_TYPE_BUY if side == "BUY" else mt5.ORDER_TYPE_SELL,
            "price": price,
            "sl": sl,
            "tp": tp,
            "deviation": 20,
            "magic": 234000,
            "comment": "TradeGuard Execution",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": filling_type,
        }
        
        print(f"DEBUG: MT5 Request -> {request}")
        
        result = mt5.order_send(request)
        if result is None:
            return {"success": False, "message": f"No response from MT5. Last error: {mt5.last_error()}"}
            
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return {"success": False, "message": f"Order failed: {result.retcode} - {result.comment}"}
            
        return {
            "success": True, 
            "ticket": result.order,
            "price": result.price,
            "message": "Trade executed successfully"
        }

    def close_trade(self, ticket: int):
        if not self.connected or mt5 is None:
            return {"success": True, "message": "Simulated trade closure (MT5 disconnected or library missing)"}
        
        positions = mt5.positions_get(ticket=ticket)
        if not positions or len(positions) == 0:
            return {"success": False, "message": f"Position with ticket {ticket} not found"}
        
        position = positions[0]
        symbol = position.symbol
        lot_size = position.volume
        order_type = mt5.ORDER_TYPE_SELL if position.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return {"success": False, "message": "Failed to get market price for closure"}
            
        price = tick.bid if order_type == mt5.ORDER_TYPE_SELL else tick.ask
        
        # Filling Mode logic
        symbol_info = mt5.symbol_info(symbol)
        filling_mode = symbol_info.filling_mode
        if filling_mode & 1:
            filling_type = mt5.ORDER_FILLING_FOK
        elif filling_mode & 2:
            filling_type = mt5.ORDER_FILLING_IOC
        else:
            filling_type = mt5.ORDER_FILLING_RETURN

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": lot_size,
            "type": order_type,
            "position": ticket,
            "price": price,
            "deviation": 20,
            "magic": 234000,
            "comment": "TradeGuard Closure",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": filling_type,
        }
        
        result = mt5.order_send(request)
        if result is None:
            return {"success": False, "message": f"No response from MT5. Last error: {mt5.last_error()}"}
            
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return {"success": False, "message": f"Order failed: {result.retcode} - {result.comment}"}
            
        return {"success": True, "message": "Trade closed successfully"}

mt5_service = MT5Service()
