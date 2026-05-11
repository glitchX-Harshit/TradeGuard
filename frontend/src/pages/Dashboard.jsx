import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDashboardSummary, getTradeHistory, closeTrade } from '../services/api'
import { Wallet, Activity, ShieldCheck, TrendingUp, TrendingDown, Clock, AlertTriangle, X } from 'lucide-react'

export default function Dashboard() {
  const { data: summary } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary, refetchInterval: 2000 })
  const { data: history } = useQuery({ queryKey: ['trades'], queryFn: getTradeHistory, refetchInterval: 2000 })

  const queryClient = useQueryClient()
  const closeMutation = useMutation({
    mutationFn: (ticket) => closeTrade(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    }
  })

  const stats = summary?.data || { balance: 0, equity: 0, margin: 0, profit: 0, open_trades_count: 0, violations_count: 0, discipline_score: 100 }
  const trades = history?.data || []

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Surgical Header */}
      <header className="p-6 lg:p-12 border-b border-alabaster-border flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black text-alabaster-deep uppercase">Analytics</h2>
          <p className="text-[10px] lg:text-[12px] text-alabaster-muted mt-2 font-bold tracking-[0.2em] uppercase">Institutional Risk Monitoring</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-[10px] text-alabaster-muted font-bold tracking-widest uppercase">System Status</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-alabaster-deep">OPERATIONAL</span>
          </div>
        </div>
      </header>

      {/* Swiss Grid Layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-12 border-b border-alabaster-border">
          
          {/* Main Metrics (8 Columns) */}
          <div className="col-span-12 lg:col-span-8 border-r border-alabaster-border">
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-alabaster-border">
              <MetricBlock title="Total Balance" value={`$${(stats.balance || 0).toFixed(2)}`} subValue="+2.4% vs last session" trend="up" />
              <MetricBlock title="Current Equity" value={`$${(stats.equity || 0).toFixed(2)}`} subValue="Real-time valuation" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-alabaster-border">
              <SmallMetricBlock title="Open Positions" value={stats.open_trades_count || 0} />
              <SmallMetricBlock title="Used Margin" value={`$${(stats.margin || 0).toFixed(2)}`} />
              <SmallMetricBlock title="Discipline Score" value={`${stats.discipline_score || 0}%`} color={stats.discipline_score < 80 ? "text-red-500" : "text-alabaster-deep"} />
            </div>

            {/* Trade Log */}
            <div className="p-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-xs font-black tracking-[0.3em] uppercase text-alabaster-deep">Live Signal Stream</h3>
                <span className="text-[9px] font-bold text-alabaster-muted uppercase">Showing latest 10 sequences</span>
              </div>
              <div className="space-y-1">
                {trades.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-alabaster-border text-[10px] font-bold text-alabaster-muted uppercase">Waiting for protocol execution...</div>
                ) : (
                  trades.slice(0, 10).map((trade, i) => (
                    <TradeRow 
                      key={i} 
                      trade={trade} 
                      onClose={closeMutation.mutate} 
                      isClosing={closeMutation.isPending && closeMutation.variables === trade.ticket}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Intelligence (4 Columns) */}
          <div className="col-span-12 lg:col-span-4 bg-alabaster-surface/50 p-12">
            <div className="space-y-12">
              <IntelligenceSection title="Floating PnL">
                <div className={`text-5xl surgical-metric ${(stats.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(stats.profit || 0).toFixed(2)}
                </div>
                <p className="text-[9px] font-black text-alabaster-muted uppercase mt-2">Active Risk Delta</p>
              </IntelligenceSection>

              <IntelligenceSection title="Discipline Infractions">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 flex items-center justify-center border ${stats.violations_count > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <AlertTriangle size={20} className={stats.violations_count > 0 ? 'text-red-500' : 'text-green-500'} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-alabaster-deep">{stats.violations_count || 0}</div>
                    <p className="text-[9px] font-bold text-alabaster-muted uppercase">Governance Breaches</p>
                  </div>
                </div>
              </IntelligenceSection>

              <div className="pt-12 border-t border-alabaster-border">
                <h4 className="text-[9px] font-black tracking-[0.3em] uppercase text-alabaster-muted mb-6">Security Brief</h4>
                <div className="space-y-4">
                  <SecurityItem label="Kernel Risk Engine" status="ACTIVE" />
                  <SafetyItem label="SL/TP Enforcement" status="MANDATORY" />
                  <SafetyItem label="Cooldown Protocol" status="STANDBY" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBlock({ title, value, subValue, trend }) {
  return (
    <div className="p-12 group hover:bg-alabaster-surface transition-colors border-r border-alabaster-border last:border-r-0">
      <p className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-4">{title}</p>
      <div className="flex items-baseline space-x-3">
        <span className="text-5xl surgical-metric text-alabaster-deep">{value}</span>
        {trend && <TrendingUp size={20} className="text-green-500" />}
      </div>
      <p className="text-[9px] font-bold text-alabaster-muted uppercase mt-3">{subValue}</p>
    </div>
  )
}

function SmallMetricBlock({ title, value, color = "text-alabaster-deep" }) {
  return (
    <div className="p-8 border-r border-alabaster-border last:border-r-0">
      <p className="text-[9px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-2">{title}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function TradeRow({ trade, onClose, isClosing }) {
  return (
    <div className="flex items-center justify-between p-4 border border-alabaster-border hover:border-alabaster-deep transition-all group">
      <div className="flex items-center space-x-6">
        <div className={`w-1 h-8 ${trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="text-xs font-black text-alabaster-deep uppercase">{trade.symbol}</p>
          <p className="text-[9px] font-bold text-alabaster-muted uppercase">{trade.side} • {trade.lot_size} LOTS</p>
        </div>
      </div>
      <div className="flex items-center space-x-12">
        <div className="text-right flex items-center space-x-4">
          <div>
            <p className="text-[10px] font-black uppercase text-alabaster-deep">{trade.status}</p>
            <div className="flex items-center text-[9px] font-bold text-alabaster-muted uppercase">
              <Clock size={10} className="mr-1" />
              {new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
          {trade.status === 'OPEN' && (
            <button 
              onClick={() => onClose(trade.ticket)}
              disabled={isClosing}
              className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Close Trade"
            >
              {isClosing ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <X size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function IntelligenceSection({ title, children }) {
  return (
    <div>
      <h4 className="text-[9px] font-black tracking-[0.3em] uppercase text-alabaster-muted mb-4">{title}</h4>
      {children}
    </div>
  )
}

function SecurityItem({ label, status }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-alabaster-deep uppercase">{label}</span>
      <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5">{status}</span>
    </div>
  )
}

function SafetyItem({ label, status }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-alabaster-deep uppercase">{label}</span>
      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5">{status}</span>
    </div>
  )
}
