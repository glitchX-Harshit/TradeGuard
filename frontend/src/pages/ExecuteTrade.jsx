import { useState, useEffect } from 'react'
import { executeTrade, getSymbolInfo } from '../services/api'
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Crosshair, Target } from 'lucide-react'
import MagButton from '../components/MagButton'
import CustomSelect from '../components/CustomSelect'

export default function ExecuteTrade() {
  const [form, setForm] = useState({
    symbol: 'EURUSD',
    order_type: 'BUY',
    lot_size: 0.1,
    risk_reward_ratio: 2.0,
    stop_loss_pips: 20
  })
  const [symbolData, setSymbolData] = useState({
    price: 1.1000,
    digits: 5,
    pip_size: 0.0001,
    tick_size: 0.00001
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch symbol info on mount and when symbol changes
  useEffect(() => {
    let interval;
    const fetchInfo = async () => {
      try {
        const res = await getSymbolInfo(form.symbol);
        setSymbolData(res.data);
      } catch (err) {
        console.error("Failed to fetch symbol info", err);
      }
    };

    fetchInfo();
    interval = setInterval(fetchInfo, 5000); // Update price every 5s
    return () => clearInterval(interval);
  }, [form.symbol]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await executeTrade({
        ...form,
        lot_size: parseFloat(form.lot_size),
        risk_reward_ratio: parseFloat(form.risk_reward_ratio),
        stop_loss_pips: parseFloat(form.stop_loss_pips)
      })
      setStatus({ type: 'success', message: `Trade executed successfully. Ticket: ${res.data.ticket || 'Simulated'}` })
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to execute trade' })
    } finally {
      setLoading(false)
    }
  }

  // Preview Calculations
  const slDistance = form.stop_loss_pips * symbolData.pip_size;
  const tpDistance = slDistance * form.risk_reward_ratio;
  
  const calculatedSL = form.order_type === 'BUY' 
    ? (symbolData.price - slDistance).toFixed(symbolData.digits)
    : (symbolData.price + slDistance).toFixed(symbolData.digits);

  const calculatedTP = form.order_type === 'BUY'
    ? (symbolData.price + tpDistance).toFixed(symbolData.digits)
    : (symbolData.price - tpDistance).toFixed(symbolData.digits);

  const tpPips = form.stop_loss_pips * form.risk_reward_ratio

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 lg:p-12 border-b border-alabaster-border">
        <h2 className="text-3xl lg:text-5xl font-black text-alabaster-deep uppercase">Trade Execution</h2>
        <p className="text-[10px] lg:text-[12px] text-alabaster-muted mt-2 font-bold tracking-[0.2em] uppercase">Manual Entry Protocol</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {status && (
          <div className={`p-6 mb-8 border flex items-center space-x-4 ${status.type === 'success' ? 'bg-green-50/30 border-green-100 text-green-700' : 'bg-red-50/30 border-red-100 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-xs font-bold uppercase tracking-tight">{status.message}</span>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 max-w-6xl">
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-12">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-10">
              <CustomSelect 
                label="Asset Symbol" 
                value={form.symbol} 
                options={['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']} 
                onChange={(val) => setForm({ ...form, symbol: val })} 
              />
              
              <FormField label="Order Type">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setForm({ ...form, order_type: 'BUY' })} 
                    className={`flex-1 py-4 border-2 text-[11px] font-black tracking-widest transition-all duration-300 transform ${
                      form.order_type === 'BUY' 
                      ? 'bg-green-600 border-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] scale-[1.02]' 
                      : 'bg-white border-alabaster-border text-alabaster-muted hover:border-green-600/30 hover:text-green-600'
                    }`}
                  >
                    BUY
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setForm({ ...form, order_type: 'SELL' })} 
                    className={`flex-1 py-4 border-2 text-[11px] font-black tracking-widest transition-all duration-300 transform ${
                      form.order_type === 'SELL' 
                      ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02]' 
                      : 'bg-white border-alabaster-border text-alabaster-muted hover:border-red-600/30 hover:text-red-600'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </FormField>

              <FormField label="Position Size (LOTS)">
                <input type="number" step="0.01" name="lot_size" value={form.lot_size} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>

              <FormField label="Risk/Reward Ratio">
                <input type="number" step="0.1" name="risk_reward_ratio" value={form.risk_reward_ratio} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>

              <FormField label="Stop Loss (PIPS)" className="md:col-span-2">
                <input type="number" step="1" name="stop_loss_pips" value={form.stop_loss_pips} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>
            </div>

            <div className="p-8 md:p-12 border border-alabaster-border bg-alabaster-surface/30 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-4 flex items-center">
                  <TrendingUp size={12} className="mr-2" /> Live Market Entry
                </p>
                <p className="text-2xl font-black text-alabaster-deep surgical-metric">{symbolData.price.toFixed(symbolData.digits)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-4 flex items-center">
                  <Crosshair size={12} className="mr-2" /> Calculated SL
                </p>
                <p className="text-2xl font-black text-red-600 surgical-metric">{calculatedSL}</p>
                <p className="text-[9px] font-bold text-alabaster-muted mt-1 uppercase">{form.stop_loss_pips} PIPS DISTANCE</p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-4 flex items-center">
                  <Target size={12} className="mr-2" /> Calculated TP
                </p>
                <p className="text-2xl font-black text-green-600 surgical-metric">{calculatedTP}</p>
                <p className="text-[9px] font-bold text-alabaster-muted mt-1 uppercase">{tpPips} PIPS DISTANCE (1:{form.risk_reward_ratio})</p>
              </div>
            </div>

            <MagButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : `Initiate ${form.order_type} Transaction`}
            </MagButton>
          </form>

          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 border border-alabaster-border bg-alabaster-surface/10">
              <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-alabaster-deep mb-6">Execution Specs</h3>
              <div className="space-y-4">
                <SpecItem label="Digits" value={symbolData.digits} />
                <SpecItem label="Pip Size" value={symbolData.pip_size} />
                <SpecItem label="Tick Size" value={symbolData.tick_size} />
              </div>
            </div>
            
            <div className="p-8 border border-alabaster-border">
              <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-alabaster-deep mb-6">Safety Brief</h3>
              <ul className="space-y-6">
                <SafetyItem label="Risk Engine Active" />
                <SafetyItem label="Lot Size Validated" />
                <SafetyItem label="Drawdown Buffer Check" />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase">{label}</label>
      {children}
    </div>
  )
}

function SpecItem({ label, value }) {
  return (
    <div className="flex justify-between border-b border-dashed border-alabaster-border pb-2">
      <span className="text-[9px] font-bold text-alabaster-muted uppercase">{label}</span>
      <span className="text-[10px] font-black text-alabaster-deep">{value}</span>
    </div>
  )
}

function SafetyItem({ label }) {
  return (
    <li className="flex items-center space-x-3 text-[10px] font-bold text-alabaster-muted uppercase tracking-tight">
      <CheckCircle2 size={14} className="text-green-500" />
      <span>{label}</span>
    </li>
  )
}
