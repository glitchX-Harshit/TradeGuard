import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// MT5 Connection
export const connectMT5 = (data) => api.post('/connect-mt5', data);

// Trade Execution
export const executeTrade = (data) => api.post('/execute-trade', data);
export const getTradeHistory = () => api.get('/trade-history');
export const getOpenTrades = () => api.get('/open-trades');
export const getSymbolInfo = (symbol) => api.get(`/symbol-info/${symbol}`);
export const closeTrade = (ticket) => api.post(`/close-trade/${ticket}`);

// Governance & Rules
export const getRules = () => api.get('/rules');
export const updateRules = (data) => api.post('/update-rules', data);
export const createRule = (data) => api.post('/create-rule', data);
export const resetGovernance = () => api.post('/reset-governance');

// Analytics & Violations
export const getDashboardSummary = () => api.get('/dashboard-summary');
export const getViolations = () => api.get('/violations');

export default api;
