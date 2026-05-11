import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Shield, AlertTriangle, Activity, Server, Menu, X, Brain, MessageSquare } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import ExecuteTrade from './pages/ExecuteTrade'
import Rules from './pages/Rules'
import Violations from './pages/Violations'
import Connect from './pages/Connect'
import AICoach from './pages/AICoach'
import AIChat from './pages/AIChat'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-white text-alabaster-deep">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-alabaster-border z-50 flex items-center justify-between px-6">
          <h1 className="text-xl font-black tracking-tighter text-alabaster-deep uppercase">TradeGuard</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-alabaster-deep p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar / Drawer */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 glass-card border-r border-alabaster-border flex flex-col transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="hidden lg:block p-8 border-b border-alabaster-border">
            <h1 className="text-2xl font-black tracking-tighter text-alabaster-deep uppercase">TradeGuard</h1>
            <p className="text-[10px] text-alabaster-muted mt-1 font-bold tracking-widest uppercase">Risk Enforcement</p>
          </div>
          <nav className="flex-1 p-6 lg:p-0 lg:py-6 space-y-1 mt-16 lg:mt-0">
            <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/execute" icon={<Activity size={18} />} label="Execute Trade" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/ai-coach" icon={<Brain size={18} />} label="AI Coach" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/ai-chat" icon={<MessageSquare size={18} />} label="Coach Chat" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/rules" icon={<Shield size={18} />} label="Rule Engine" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/violations" icon={<AlertTriangle size={18} />} label="Violations" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/connect" icon={<Server size={18} />} label="Connect MT5" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
        </div>

        {/* Backdrop for mobile drawer */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto mt-16 lg:mt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/execute" element={<ExecuteTrade />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/violations" element={<Violations />} />
            <Route path="/connect" element={<Connect />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

function SidebarLink({ to, icon, label, onClick }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} onClick={onClick} className={`flex items-center space-x-3 p-4 transition-all duration-300 group border-l-4 ${
      isActive 
      ? 'border-[#111111] text-[#111111] bg-alabaster-surface' 
      : 'border-transparent text-alabaster-muted hover:bg-alabaster-surface hover:text-alabaster-deep'
    }`}>
      <span className={`${isActive ? 'text-[#111111]' : 'text-alabaster-muted group-hover:text-alabaster-deep'} transition-colors`}>{icon}</span>
      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isActive ? 'text-[#111111]' : 'text-alabaster-muted group-hover:text-alabaster-deep'} transition-colors`}>{label}</span>
    </Link>
  )
}

export default App
