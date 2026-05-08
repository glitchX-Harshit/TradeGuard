import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, Shield, AlertTriangle, Activity } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import ExecuteTrade from './pages/ExecuteTrade'
import Rules from './pages/Rules'
import Violations from './pages/Violations'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#0b0d10] text-[#f8fafc]">
        {/* Sidebar */}
        <div className="w-64 glass-card border-r border-[#1e293b] flex flex-col">
          <div className="p-6 border-b border-[#1e293b]">
            <h1 className="text-2xl font-bold gradient-text tracking-wider">TradeGuard</h1>
            <p className="text-xs text-[#94a3b8] mt-1 font-medium">Risk Enforcement System</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors font-medium">
              <LayoutDashboard size={20} className="text-blue-500" />
              <span>Dashboard</span>
            </Link>
            <Link to="/execute" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors font-medium">
              <Activity size={20} className="text-green-500" />
              <span>Execute Trade</span>
            </Link>
            <Link to="/rules" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors font-medium">
              <Shield size={20} className="text-purple-500" />
              <span>Rule Engine</span>
            </Link>
            <Link to="/violations" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors font-medium">
              <AlertTriangle size={20} className="text-red-500" />
              <span>Violations</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/execute" element={<ExecuteTrade />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/violations" element={<Violations />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
