import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <label className="text-[10px] font-black tracking-[0.2em] text-alabaster-muted uppercase">{label}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-alabaster-border p-4 flex justify-between items-center cursor-pointer hover:border-alabaster-deep transition-all"
      >
        <span className="text-sm font-bold text-alabaster-deep uppercase tracking-widest">{value}</span>
        <ChevronDown size={16} className={`text-alabaster-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-alabaster-border shadow-2xl overflow-hidden"
          >
            {options.map((opt) => (
              <div 
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className={`p-4 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                  value === opt ? 'bg-alabaster-deep text-white' : 'text-alabaster-deep hover:bg-alabaster-surface'
                }`}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
