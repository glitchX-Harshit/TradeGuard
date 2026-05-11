import { useState, useEffect } from 'react'
import { getRules, updateRules, resetGovernance } from '../services/api'
import { ShieldCheck, AlertCircle, Save, RotateCcw } from 'lucide-react'
import MagButton from '../components/MagButton'

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
  const [status, setStatus] = useState(null)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    getRules().then(res => setForm(res.data))
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : parseFloat(e.target.value)
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateRules(form)
      setStatus({ type: 'success', message: 'Rules updated successfully. Protection active.' })
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update governance rules.' })
    }
  }

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all violations and trade limits? This will clear your daily history.")) return;
    
    setResetting(true)
    try {
      await resetGovernance()
      setStatus({ type: 'success', message: 'Governance and trade limits reset successfully.' })
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to reset governance.' })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 lg:p-12 border-b border-alabaster-border">
        <h2 className="text-3xl lg:text-5xl font-black text-alabaster-deep uppercase">Rule Engine</h2>
        <p className="text-[10px] lg:text-[12px] text-alabaster-muted mt-2 font-bold tracking-[0.2em] uppercase">Governance & Guardrails</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-5xl">
        {status && (
          <div className={`p-6 mb-8 border flex items-center space-x-4 ${status.type === 'success' ? 'bg-green-50/30 border-green-100 text-green-700' : 'bg-red-50/30 border-red-100 text-red-700'}`}>
            <ShieldCheck size={20} />
            <span className="text-xs font-bold uppercase tracking-tight">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RuleField label="Max Daily Trades" hint="Hard limit for transaction sequences per 24h">
              <input type="number" name="max_trades" value={form.max_trades} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
            </RuleField>

            <RuleField label="Max Daily Loss ($)" hint="Session termination threshold">
              <input type="number" name="max_daily_loss" value={form.max_daily_loss} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
            </RuleField>

            <RuleField label="Risk Per Trade (%)" hint="Lot size calculation basis">
              <input type="number" step="0.1" name="risk_percentage" value={form.risk_percentage} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
            </RuleField>

            <RuleField label="Min R:R Ratio" hint="Minimum allowed risk-to-reward for execution">
              <input type="number" step="0.1" name="rr_ratio" value={form.rr_ratio} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
            </RuleField>

            <RuleField label="Revenge Trading Block" hint="Prevent immediate re-entry after stop-out">
              <div className="flex items-center space-x-4 pt-2">
                <input 
                  type="checkbox" 
                  name="revenge_trading_block" 
                  checked={form.revenge_trading_block} 
                  onChange={handleChange} 
                  className="w-8 h-8 accent-[#111111] cursor-pointer border-alabaster-border" 
                />
                <span className="text-[10px] font-black uppercase text-alabaster-deep tracking-widest">{form.revenge_trading_block ? 'ENFORCED' : 'DISABLED'}</span>
              </div>
            </RuleField>

            <RuleField label="Protocol Cooldown (Min)" hint="Minimum delay between trade clusters">
              <input type="number" name="cooldown_minutes" value={form.cooldown_minutes} onChange={handleChange} className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
            </RuleField>
          </div>

          <MagButton type="submit" className="w-full md:w-auto">
            Update Governance Protocol
          </MagButton>
        </form>

        <div className="mt-24 pt-12 border-t border-alabaster-border">
          <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-red-600 mb-6 flex items-center">
            <RotateCcw size={14} className="mr-2" /> Emergency Reset Zone
          </h3>
          <div className="p-8 border border-red-100 bg-red-50/20">
            <p className="text-[10px] font-bold text-alabaster-muted uppercase tracking-widest mb-6 leading-relaxed">
              Resets all active violations, trade counters, and daily limits. Use this to bypass the governance engine if a hard-lock occurs during a critical session.
            </p>
            <button 
              onClick={handleReset}
              disabled={resetting}
              className="px-8 py-4 bg-red-600 text-white text-[10px] font-black tracking-[0.2em] uppercase hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Initiate Full Governance Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RuleField({ label, children, hint }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase">{label}</label>
      {children}
      <p className="text-[9px] text-alabaster-muted font-bold uppercase tracking-tight">{hint}</p>
    </div>
  )
}
