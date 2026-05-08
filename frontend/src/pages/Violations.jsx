import { useQuery } from '@tanstack/react-query'
import { getViolations } from '../services/api'
import { AlertOctagon, Clock } from 'lucide-react'

export default function Violations() {
  const { data, isLoading } = useQuery({ queryKey: ['violations'], queryFn: getViolations, refetchInterval: 3000 })
  const violations = data?.data || []

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Warning Center</h2>
        <p className="text-[#94a3b8] mt-1">Review blocked trades and discipline infractions.</p>
      </header>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-[#94a3b8] text-center p-8">Loading violations...</div>
        ) : violations.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Clean Record</h3>
            <p className="text-[#94a3b8]">You have no trading violations. Keep up the good discipline!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {violations.map((v, i) => (
              <div key={i} className="glass-card p-6 rounded-xl border-l-4 border-l-red-500 hover:bg-white/5 transition-colors relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4 relative">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertOctagon className="text-red-500" size={24} />
                  </div>
                  <span className="text-xs font-medium text-[#64748b] bg-[#0f1115] px-2 py-1 rounded">
                    {new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="relative">
                  <h4 className="font-bold text-white mb-1 text-lg">{v.violation_type}</h4>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{v.reason}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center text-xs text-[#64748b]">
                  <Clock size={12} className="mr-1" />
                  {new Date(v.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
