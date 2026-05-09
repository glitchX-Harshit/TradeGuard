# 🛡️ TradeGuard AI
### **Institutional-Grade Risk Enforcement & Trading Discipline Terminal**

TradeGuard is a premium, surgical-precision trading terminal designed to enforce strict risk management protocols and trading discipline. Built with a **"Pure Alabaster"** Swiss-grid design, it provides high-density market analytics while ensuring that every trade adheres to predefined governance guardrails.

---

## 🏛️ Architecture & File Structure

```text
TradeGuard/
├── 📁 backend/                # FastAPI Production Server
│   ├── 📁 database/           # SQLite Persistence & Schema
│   ├── 📁 models/             # SQLAlchemy ORM Persona Models
│   ├── 📁 routes/             # REST API Handlers (Trade, Rules, Analytics)
│   ├── 📁 schemas/            # Pydantic Data Validation
│   ├── 📁 services/           # MT5 Connection & Rule Engine Logic
│   └── 📄 main.py             # Application Entry Point
├── 📁 frontend/               # React + Vite + Tailwind CSS
│   ├── 📁 src/
│   │   ├── 📁 components/     # MagButton, CustomSelect, Layouts
│   │   ├── 📁 pages/          # Dashboard, ExecuteTrade, Rules, Violations
│   │   ├── 📁 services/       # Axios API Client
│   │   └── 📄 App.jsx         # Routing & Mobile Navigation
│   └── 📄 tailwind.config.js  # Alabaster Theme Tokens
├── 📄 .gitignore              # Repository Governance
└── 📄 README.md               # System Documentation
```

---

## 🚀 Key Features

- **Pure Alabaster UI:** A high-end, white-on-white institutional design system using Poppins typography and 12-column Swiss grids.
- **Magnetic Interaction:** Premium `MagButton` components with cursor-tracking and liquid-fill hover effects.
- **Rule Engine:** Real-time enforcement of Max Daily Loss, Position Sizing, and Revenge Trading blocks.
- **MT5 Integration:** Secure, low-latency handshake with MetaTrader 5 terminals.
- **Mobile Responsive:** Fully adaptive architecture for risk monitoring on the go.

---

## 🛠️ Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

---

## ⚖️ Governance & License
TradeGuard is designed for professional traders who require absolute discipline. It acts as a hard buffer between the trader and the market, preventing impulsive decisions through automated protocol enforcement.

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
