import { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Zap, ShieldCheck, Info } from 'lucide-react'
import { getJournalEntries, getBehavioralPatterns, getDisciplineScore, analyzeBehaviorNow } from '../services/api'

function AICoach() {
  const [entries, setEntries] = useState([])
  const [patterns, setPatterns] = useState([])
  const [discipline, setDiscipline] = useState({ score: 0, status: 'N/A' })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [entriesRes, patternsRes, scoreRes] = await Promise.all([
        getJournalEntries(),
        getBehavioralPatterns(),
        getDisciplineScore()
      ])
      setEntries(entriesRes.data)
      setPatterns(patternsRes.data)
      setDiscipline(scoreRes.data)
    } catch (error) {
      console.error("Error fetching AI Coach data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      await analyzeBehaviorNow()
      await fetchData()
    } catch (error) {
      console.error("Error analyzing behavior:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-alabaster-muted animate-pulse font-black uppercase tracking-widest">Scanning Behavior...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-2">Behavioral Intelligence</p>
          <h2 className="text-5xl font-black tracking-tighter text-alabaster-deep">AI COACH <span className="text-black/20">SYSTEM</span></h2>
        </div>
        <button 
          onClick={handleAnalyze}
          className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#333] transition-all flex items-center space-x-3"
        >
          <Brain size={16} />
          <span>Sync Behavior Engine</span>
        </button>
      </header>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-10 border border-alabaster-border flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-black/5 flex items-center justify-center mb-6 relative">
            <span className="text-5xl font-black tracking-tighter">{discipline.score}</span>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full rotate-45 opacity-20"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted mb-1">Discipline Score</p>
          <p className={`text-sm font-black uppercase tracking-widest ${discipline.score > 70 ? 'text-green-600' : 'text-red-600'}`}>{discipline.status}</p>
        </div>

        <div className="col-span-1 md:col-span-2 glass-card p-10 border border-alabaster-border flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted mb-6 flex items-center">
              <Zap size={14} className="mr-2 text-black" />
              Primary Strength
            </p>
            <h3 className="text-3xl font-black tracking-tighter mb-4">RULE ADHERENCE</h3>
            <p className="text-sm text-alabaster-muted leading-relaxed max-w-md">
              You've maintained consistent stop loss placement over your last 10 trades. This is the foundation of a professional mindset.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-alabaster-border flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">SL Discipline: {discipline.sl_adherence || '100%'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Risk Control: Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Patterns */}
      <section>
        <h3 className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-8 flex items-center">
          <TrendingUp size={16} className="mr-2" />
          Detected Behavioral Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {patterns.length > 0 ? patterns.map((pattern, idx) => (
            <div key={idx} className="glass-card p-8 border border-alabaster-border relative group hover:border-black transition-colors">
              <div className="absolute top-8 right-8 text-[10px] font-black text-black/10">{(pattern.confidence * 100).toFixed(0)}% CONFIDENCE</div>
              <div className={`w-10 h-10 mb-6 flex items-center justify-center ${pattern.pattern_type === 'overtrading' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                <AlertCircle size={20} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-3">{pattern.pattern_type.replace('_', ' ')}</h4>
              <p className="text-[13px] text-alabaster-muted leading-relaxed mb-6">
                {pattern.explanation}
              </p>
              <div className="bg-alabaster-surface p-4 border-l-2 border-black">
                <p className="text-[10px] font-bold uppercase tracking-widest text-alabaster-deep mb-1">Recommendation</p>
                <p className="text-[11px] text-alabaster-muted leading-relaxed">{pattern.recommendation}</p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center glass-card border border-dashed border-alabaster-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted">No high-confidence patterns detected yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Journal Feed */}
      <section>
        <h3 className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase mb-8 flex items-center">
          <Brain size={16} className="mr-2" />
          Intelligent Reflection Feed
        </h3>
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={idx} className="glass-card p-6 border-l-4 border-alabaster-border hover:border-black transition-all flex items-start space-x-6">
              <div className={`mt-1 p-2 rounded-sm ${
                entry.severity === 'critical' ? 'bg-red-50 text-red-600' : 
                entry.severity === 'warning' ? 'bg-orange-50 text-orange-600' : 
                'bg-blue-50 text-blue-600'
              }`}>
                <Info size={16} />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-alabaster-deep">
                    {entry.entry_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-alabaster-muted">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-alabaster-muted leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AICoach
