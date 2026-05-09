import { useQuery } from '@tanstack/react-query'
import { getViolations } from '../services/api'
import { AlertOctagon, Clock, ShieldCheck } from 'lucide-react'

export default function Violations() {
  const { data, isLoading } = useQuery({ queryKey: ['violations'], queryFn: getViolations, refetchInterval: 3000 })
  const violations = data?.data || []

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 md:p-12 border-b border-alabaster-border">
        <h2 className="text-3xl lg:text-5xl font-black text-red-600 uppercase">Warning Center</h2>
        <p className="text-[10px] lg:text-[12px] text-alabaster-muted mt-2 font-bold tracking-[0.2em] uppercase">Discipline Infractions</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {isLoading ? (
          <div className="text-alabaster-muted text-[10px] font-black uppercase tracking-widest text-center py-20">Analyzing Signal Stream...</div>
        ) : violations.length === 0 ? (
          <div className="p-20 text-center border border-alabaster-border rounded flex flex-col items-center max-w-2xl mx-auto">
            <ShieldCheck size={48} className="text-green-500 mb-6" strokeWidth={1} />
            <h3 className="text-xs font-black text-alabaster-deep uppercase tracking-[0.3em] mb-2">Pristine Discipline</h3>
            <p className="text-[10px] text-alabaster-muted font-bold uppercase">No governance breaches detected in the current session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-1 border-t border-l border-alabaster-border">
            {violations.map((v, i) => (
              <ViolationCard key={i} violation={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ViolationCard({ violation }) {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4 p-8 border-r border-b border-alabaster-border hover:bg-red-50/20 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-2 border border-red-100 bg-red-50/50 rounded">
          <AlertOctagon size={18} className="text-red-500" />
        </div>
        <span className="text-[9px] font-black text-alabaster-muted uppercase tracking-tighter">
          {new Date(violation.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      
      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">{violation.violation_type}</h4>
      <p className="text-xs font-bold text-alabaster-deep uppercase leading-relaxed mb-8">{violation.reason}</p>
      
      <div className="flex items-center space-x-2 text-[9px] font-black text-alabaster-muted uppercase">
        <Clock size={12} />
        <span>{new Date(violation.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
