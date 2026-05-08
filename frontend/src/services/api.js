import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const connectMT5 = (data) => api.post('/connect-mt5', data);
export const executeTrade = (data) => api.post('/execute-trade', data);
export const getTradeHistory = () => api.get('/trade-history');
export const getOpenTrades = () => api.get('/open-trades');
export const createRule = (data) => api.post('/create-rule', data);
export const getRules = () => api.get('/rules');
export const getDashboardSummary = () => api.get('/dashboard-summary');
export const getViolations = () => api.get('/violations');

export default api;
