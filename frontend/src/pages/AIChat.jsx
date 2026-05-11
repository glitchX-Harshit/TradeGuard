import { useState, useRef, useEffect } from 'react'
import { Send, User, Brain, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sendAIChatMessage } from '../services/api'

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello. I'm your Behavioral Trading Coach. I've analyzed your recent trades and discipline patterns. How can I help you improve your edge today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await sendAIChatMessage(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])
    } catch (error) {
      console.error("Error sending chat message:", error)
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the behavior engine right now. Please try again in a moment." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-alabaster-surface">
      {/* Header */}
      <header className="p-6 bg-white border-b border-alabaster-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/ai-coach" className="text-alabaster-muted hover:text-black transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-alabaster-deep">AI COACH CHAT</h2>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 animate-pulse"></span>
              Live Behavioral Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full">
          <Brain size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">v2.0 Beta</span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl flex items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-black text-white' : 'bg-alabaster-border text-alabaster-deep'
              }`}>
                {msg.role === 'assistant' ? <Brain size={18} /> : <User size={18} />}
              </div>
              <div className={`p-6 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' 
                ? 'bg-white border border-alabaster-border text-alabaster-deep' 
                : 'bg-black text-white'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <Brain size={18} className="animate-pulse" />
              </div>
              <div className="p-6 bg-white border border-alabaster-border rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-alabaster-border">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your performance, weaknesses, or discipline..."
            className="w-full bg-alabaster-surface border border-alabaster-border p-6 pr-20 rounded-xl focus:outline-none focus:border-black transition-colors text-sm"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-lg hover:bg-[#333] transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={() => setInput("Why am I losing?")} className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted hover:text-black transition-colors">"Why am I losing?"</button>
          <button onClick={() => setInput("What is my biggest weakness?")} className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted hover:text-black transition-colors">"What is my weakness?"</button>
          <button onClick={() => setInput("How disciplined am I?")} className="text-[10px] font-black uppercase tracking-widest text-alabaster-muted hover:text-black transition-colors">"How disciplined am I?"</button>
        </div>
      </div>
    </div>
  )
}

export default AIChat
