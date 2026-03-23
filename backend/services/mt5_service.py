import MetaTrader5 as mt5

mt5.initialize()

symbol = "EURUSD"
mt5.symbol_select(symbol, True)

tick = mt5.symbol_info_tick(symbol)

# Stop Loss & Take Profit
sl = tick.ask - 0.0020   # 20 pips
tp = tick.ask + 0.0040   # 40 pips

request = {
    "action": mt5.TRADE_ACTION_DEAL,
    "symbol": symbol,
    "volume": 0.01,
    "type": mt5.ORDER_TYPE_BUY,
    "price": tick.ask,
    "sl": sl,
    "tp": tp,
    "deviation": 20,
    "magic": 123456,
    "comment": "test order",
    "type_time": mt5.ORDER_TIME_GTC,
    "type_filling": mt5.ORDER_FILLING_FOK,
}

result = mt5.order_send(request)

print(result)