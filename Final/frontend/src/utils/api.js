// import axios from 'axios';

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
//   timeout: 60000,
//   headers: { 'Content-Type': 'application/json' }
// });

// // Log errors in dev
// API.interceptors.response.use(
//   res => res,
//   err => {
//     if (process.env.NODE_ENV === 'development') {
//       console.error('[API Error]', err?.response?.status, err?.response?.data || err.message);
//     }
//     return Promise.reject(err);
//   }
// );

// export const runAudit  = (url)  => API.post('/audit', { url });
// export const getReports = ()    => API.get('/reports');
// export const getReport  = (id)  => API.get(`/reports/${id}`);
// export const deleteReport = (id) => API.delete(`/reports/${id}`);

// export default API;
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('dpdp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const runAudit    = (url) => API.post('/audit', { url });
export const getReports  = ()    => API.get('/reports');
export const getReport   = (id)  => API.get(`/reports/${id}`);
export const deleteReport = (id) => API.delete(`/reports/${id}`);

export default API;