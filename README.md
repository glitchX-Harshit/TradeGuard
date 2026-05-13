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

### 3. Development Tunnel (ngrok)
To test the mobile-responsive features or connect to external services while developing locally, use `ngrok` to expose your backend:

1. Start your backend on port 8000.
2. Run ngrok:
   ```bash
   ngrok http 8000
   ```
3. Copy the `https://...` URL provided by ngrok.
4. Update your frontend `.env` or `VITE_API_URL` to point to this URL.

**Note on Tunnel Handshake:**
TradeGuard is pre-configured to send the `ngrok-skip-browser-warning` header. This bypasses the ngrok interstitial page, allowing the frontend to communicate with the backend tunnel without manual interaction.

---

## 🌐 Deployment

### **Backend (Render.com)**
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set the **Start Command** to `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`.
5. Add your environment variables (`GEMINI_API_KEY`, etc.).

### **Frontend (Vercel)**
1. Connect your repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the **Framework Preset** to `Vite`.
4. Add the Environment Variable `VITE_API_URL` pointing to your Render backend URL.

---

## ⚖️ Governance & License
TradeGuard is designed for professional traders who require absolute discipline. It acts as a hard buffer between the trader and the market, preventing impulsive decisions through automated protocol enforcement.

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
