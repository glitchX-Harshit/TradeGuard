import { useState } from 'react'
import { connectMT5 } from '../services/api'
import { Server, ShieldCheck, AlertCircle, User, Key, Database } from 'lucide-react'
import MagButton from '../components/MagButton'

export default function Connect() {
  const [form, setForm] = useState({
    login_id: '',
    password: '',
    server: ''
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await connectMT5({
        ...form,
        login_id: parseInt(form.login_id)
      })
      setStatus({ type: 'success', message: 'Terminal handshake successful. Connection authorized.' })
    } catch (err) {
      setStatus({ type: 'error', message: 'Authorization failed. Check terminal credentials.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 md:p-12 border-b border-alabaster-border">
        <h2 className="text-2xl md:text-5xl font-black text-alabaster-deep uppercase leading-none">Terminal Connection</h2>
        <p className="text-[10px] md:text-[12px] text-alabaster-muted mt-2 font-bold tracking-[0.2em] uppercase">Secure MT5 Protocol</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl">
        {status && (
          <div className={`p-6 mb-8 border flex items-center space-x-4 ${status.type === 'success' ? 'bg-green-50/30 border-green-100 text-green-700' : 'bg-red-50/30 border-red-100 text-red-700'}`}>
            {status.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            <span className="text-xs font-bold uppercase tracking-tight">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 md:gap-12">
          <div className="col-span-12 lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormField label="Trading Account ID" icon={<User size={14} />}>
                <input type="number" name="login_id" value={form.login_id} onChange={handleChange} placeholder="e.g. 50123456" className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>

              <FormField label="Master Password" icon={<Key size={14} />}>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="********" className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>

              <FormField label="Broker Server Address" icon={<Database size={14} />}>
                <input type="text" name="server" value={form.server} onChange={handleChange} placeholder="e.g. MetaQuotes-Demo" className="w-full bg-white border border-alabaster-border p-4 text-sm font-bold text-alabaster-deep focus:outline-none focus:border-alabaster-deep transition-all rounded-none" />
              </FormField>

              <MagButton type="submit" disabled={loading} className="w-full">
                {loading ? 'Authorizing...' : 'Establish Secure Connection'}
              </MagButton>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-5 bg-alabaster-surface/30 p-8 border border-alabaster-border">
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-alabaster-deep mb-6">Security Context</h3>
            <ul className="space-y-4">
              <SecurityItem label="End-to-End Encryption" />
              <SecurityItem label="Kernel Level Handshake" />
              <SecurityItem label="Direct MT5 Bridge" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children, icon }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-alabaster-deep">
        {icon}
        <label className="text-[10px] font-black tracking-[0.2em] uppercase">{label}</label>
      </div>
      {children}
    </div>
  )
}

function SecurityItem({ label }) {
  return (
    <li className="flex items-center space-x-3 text-[9px] font-bold text-alabaster-muted uppercase tracking-widest">
      <div className="w-1 h-1 bg-alabaster-deep" />
      <span>{label}</span>
    </li>
  )
}
