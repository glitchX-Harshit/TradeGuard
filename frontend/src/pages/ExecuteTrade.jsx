import { useState } from 'react'
import { executeTrade } from '../services/api'
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react'

export default function ExecuteTrade() {
  const [form, setForm] = useState({
    symbol: 'EURUSD',
    order_type: 'BUY',
    lot_size: 0.1,
    risk_reward_ratio: 2.0,
    stop_loss_pips: 20
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const tpPips = form.stop_loss_pips * form.risk_reward_ratio

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Execute Trade</h2>
        <p className="text-[#94a3b8] mt-1">Execute manually with risk guardrails active.</p>
      </header>

      {status && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="glass-card rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Symbol</label>
              <select name="symbol" value={form.symbol} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="EURUSD">EURUSD</option>
                <option value="GBPUSD">GBPUSD</option>
                <option value="USDJPY">USDJPY</option>
                <option value="XAUUSD">XAUUSD</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Order Type</label>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setForm({ ...form, order_type: 'BUY' })} className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 border transition-all ${form.order_type === 'BUY' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-[#0f1115] border-[#1e293b] text-gray-400 hover:bg-[#1a1d24]'}`}>
                  <TrendingUp size={18} /> <span>BUY</span>
                </button>
                <button type="button" onClick={() => setForm({ ...form, order_type: 'SELL' })} className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 border transition-all ${form.order_type === 'SELL' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#0f1115] border-[#1e293b] text-gray-400 hover:bg-[#1a1d24]'}`}>
                  <TrendingDown size={18} /> <span>SELL</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Lot Size</label>
              <input type="number" step="0.01" name="lot_size" value={form.lot_size} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Risk:Reward Ratio (e.g. 2 for 1:2)</label>
              <input type="number" step="0.1" name="risk_reward_ratio" value={form.risk_reward_ratio} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-[#94a3b8]">Stop Loss (Pips)</label>
              <input type="number" step="1" name="stop_loss_pips" value={form.stop_loss_pips} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="col-span-2 bg-[#0f1115] rounded-lg p-6 border border-[#1e293b] flex justify-between items-center mt-2">
              <div>
                <p className="text-sm text-[#94a3b8]">Calculated Target</p>
                <p className="text-xl font-bold text-blue-400">Take Profit: {tpPips} Pips</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#94a3b8]">Risk:Reward</p>
                <p className="text-xl font-bold text-white">1:{form.risk_reward_ratio}</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20">
            {loading ? 'Executing...' : `Execute ${form.order_type} Trade`}
          </button>
        </form>
      </div>
    </div>
  )
}
