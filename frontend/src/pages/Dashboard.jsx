import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary, getTradeHistory } from '../services/api'
import { Wallet, Activity, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function Dashboard() {
  const { data: summary } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary, refetchInterval: 2000 })
  const { data: history } = useQuery({ queryKey: ['trades'], queryFn: getTradeHistory, refetchInterval: 2000 })

  const stats = summary?.data || { balance: 0, equity: 0, margin: 0, profit: 0, open_trades_count: 0, violations_count: 0, discipline_score: 100 }
  const trades = history?.data || []

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-[#94a3b8] mt-1">Welcome back. Here is your trading performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Account Balance" value={`$${(stats.balance || 0).toFixed(2)}`} icon={<Wallet className="text-blue-500" />} />
        <StatCard title="Equity" value={`$${(stats.equity || 0).toFixed(2)}`} icon={<Activity className="text-cyan-500" />} />
        <StatCard title="Open Trades" value={stats.open_trades_count || 0} icon={<Activity className="text-green-500" />} />
        <StatCard title="Discipline Score" value={`${stats.discipline_score || 0}%`} icon={<ShieldCheck className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Floating PnL" value={`$${(stats.profit || 0).toFixed(2)}`} icon={<Activity className={(stats.profit || 0) >= 0 ? "text-green-500" : "text-red-500"} />} />
        <StatCard title="Used Margin" value={`$${(stats.margin || 0).toFixed(2)}`} icon={<ShieldCheck className="text-orange-500" />} />
        <StatCard title="Violations" value={stats.violations_count || 0} icon={<AlertTriangle className="text-red-500" />} />
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#94a3b8] text-sm">
                <th className="py-3 px-4 font-medium">Symbol</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Lot Size</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#94a3b8]">No recent trades found</td>
                </tr>
              ) : (
                trades.slice(0, 10).map((trade, i) => (
                  <tr key={i} className="border-b border-[#1e293b]/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.side === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.lot_size}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500' : 
                        trade.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#94a3b8]">{new Date(trade.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass-card rounded-xl p-6 flex items-center space-x-4">
      <div className="p-3 bg-[#1e293b] rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#94a3b8] font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}
