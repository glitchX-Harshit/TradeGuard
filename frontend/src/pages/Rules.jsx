import { useState, useEffect } from 'react'
import { getRules, createRule } from '../services/api'
import { ShieldCheck, Save, Loader2 } from 'lucide-react'

export default function Rules() {
  const [form, setForm] = useState({
    max_trades: 5,
    max_daily_loss: 100.0,
    risk_percentage: 1.0,
    rr_ratio: 2.0,
    cooldown_minutes: 30,
    max_open_positions: 2,
    revenge_trading_block: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getRules().then(res => {
      if (res.data) setForm(res.data)
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching rules:", err)
      setLoading(false)
    })
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await createRule({
        max_trades: parseInt(form.max_trades),
        max_daily_loss: parseFloat(form.max_daily_loss),
        risk_percentage: parseFloat(form.risk_percentage),
        rr_ratio: parseFloat(form.rr_ratio),
        cooldown_minutes: parseInt(form.cooldown_minutes),
        max_open_positions: parseInt(form.max_open_positions),
        revenge_trading_block: form.revenge_trading_block
      })
      setStatus({ type: 'success', message: 'Rules updated successfully' })
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      console.error("Error saving rules:", err)
      setStatus({ type: 'error', message: 'Failed to update rules' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" size={32} /></div>

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Rule Engine</h2>
        <p className="text-[#94a3b8] mt-1">Configure your risk guardrails. Trades violating these will be blocked.</p>
      </header>

      {status && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <ShieldCheck />
          <span>{status.message}</span>
        </div>
      )}

      <div className="glass-card rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Max Trades Per Day</label>
              <input type="number" name="max_trades" value={form.max_trades} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">Prevents overtrading</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Max Daily Loss ($)</label>
              <input type="number" step="0.01" name="max_daily_loss" value={form.max_daily_loss} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">Hard stop for daily drawdowns</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Risk Per Trade (%)</label>
              <input type="number" step="0.1" name="risk_percentage" value={form.risk_percentage} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">Capital at risk per trade</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Minimum Risk:Reward Ratio</label>
              <input type="number" step="0.1" name="rr_ratio" value={form.rr_ratio} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">E.g., 2.0 means every trade must aim for 1:2</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Cooldown After Loss (Mins)</label>
              <input type="number" name="cooldown_minutes" value={form.cooldown_minutes} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">Protects against emotional revenge trading</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Max Open Positions</label>
              <input type="number" name="max_open_positions" value={form.max_open_positions} onChange={handleChange} className="w-full bg-[#0f1115] border border-[#1e293b] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <p className="text-xs text-[#64748b]">Limits exposure at any given time</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0f1115] border border-[#1e293b] rounded-lg">
              <div>
                <label className="text-sm font-medium text-[#f8fafc]">Revenge Trading Guard</label>
                <p className="text-xs text-[#94a3b8]">Blocks trading immediately after a loss</p>
              </div>
              <input type="checkbox" name="revenge_trading_block" checked={form.revenge_trading_block} onChange={handleChange} className="w-6 h-6 rounded border-[#1e293b] bg-blue-600 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 mt-4">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>Save Rules</span>
          </button>
        </form>
      </div>
    </div>
  )
}
