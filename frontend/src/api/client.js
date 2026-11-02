import axios from 'axios';

// Support production Vercel deployment with dynamic backend API URL
const rawBase = import.meta.env.VITE_API_URL || '';
const cleanBase = rawBase.replace(/\/+$/, '');
const baseURL = cleanBase ? (cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary').then(res => res.data),
  getThermalOverview: (batteryId, limit = 30) =>
    api.get('/dashboard/thermal-overview', { params: { batteryId, limit } }).then(res => res.data),
  getRecentAlerts: (size = 5) =>
    api.get('/dashboard/recent-alerts', { params: { size } }).then(res => res.data),
};

export const batteriesApi = {
  getAll: (search) => api.get('/batteries', { params: { search } }).then(res => res.data),
  getById: (id) => api.get(`/batteries/${id}`).then(res => res.data),
  create: (data) => api.post('/batteries', data).then(res => res.data),
  update: (id, data) => api.put(`/batteries/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/batteries/${id}`).then(res => res.data),
};

export const sensorsApi = {
  getLatest: () => api.get('/sensors/latest').then(res => res.data),
  getLatestForBattery: (batteryId) => api.get(`/sensors/latest/${batteryId}`).then(res => res.data),
  getHistory: (batteryId, page = 0, size = 20) =>
    api.get(`/sensors/history/${batteryId}`, { params: { page, size } }).then(res => res.data),
  getCellTemps: (readingId) => api.get(`/sensors/cells/${readingId}`).then(res => res.data),
  ingestReading: (data) => api.post('/sensors/readings', data).then(res => res.data),
};

export const thermalApi = {
  getStatus: (batteryId) => api.get(`/thermal/status/${batteryId}`).then(res => res.data),
  analyze: (data) => api.post('/thermal/analyze', data).then(res => res.data),
};

export const alertsApi = {
  getAll: (params) => api.get('/alerts', { params }).then(res => res.data),
  getById: (id) => api.get(`/alerts/${id}`).then(res => res.data),
  acknowledge: (id, action) => api.put(`/alerts/${id}/acknowledge`, action).then(res => res.data),
  resolve: (id, action) => api.put(`/alerts/${id}/resolve`, action).then(res => res.data),
};

export const recommendationsApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/recommendations', { params: { page, size } }).then(res => res.data),
  getByBatteryId: (batteryId) => api.get(`/recommendations/${batteryId}`).then(res => res.data),
  getLatest: (batteryId) => api.get(`/recommendations/${batteryId}/latest`).then(res => res.data),
};

export const simulationApi = {
  getStatus: () => api.get('/simulation/status').then(res => res.data),
  start: () => api.post('/simulation/start').then(res => res.data),
  stop: () => api.post('/simulation/stop').then(res => res.data),
  pause: () => api.post('/simulation/pause').then(res => res.data),
  resume: () => api.post('/simulation/resume').then(res => res.data),
  setScenario: (scenario) => api.post(`/simulation/scenario?scenario=${scenario}`).then(res => res.data),
  setSpeed: (speed) => api.post(`/simulation/speed?speed=${speed}`).then(res => res.data),
  tick: () => api.post('/simulation/tick').then(res => res.data),
};

export const analyticsApi = {
  getTemperature: (batteryId, limit = 50) =>
    api.get('/analytics/temperature', { params: { batteryId, limit } }).then(res => res.data),
  getVoltage: (batteryId, limit = 50) =>
    api.get('/analytics/voltage', { params: { batteryId, limit } }).then(res => res.data),
  getCurrent: (batteryId, limit = 50) =>
    api.get('/analytics/current', { params: { batteryId, limit } }).then(res => res.data),
  getCoolant: (batteryId, limit = 50) =>
    api.get('/analytics/coolant', { params: { batteryId, limit } }).then(res => res.data),
};

export const settingsApi = {
  getSettings: () => api.get('/settings').then(res => res.data),
  updateSettings: (data) => api.put('/settings', data).then(res => res.data),
};

export default api;
