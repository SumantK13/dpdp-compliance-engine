import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('dpdp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('dpdp_token');
      localStorage.removeItem('dpdp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const register = async ({ name, email, password, plan }) => {
  const res = await API.post('/auth/register', { name, email, password, plan });
  const { token, user } = res.data;
  localStorage.setItem('dpdp_token', token);
  localStorage.setItem('dpdp_user', JSON.stringify(user));
  return user;
};

export const login = async ({ email, password }) => {
  const res = await API.post('/auth/login', { email, password });
  const { token, user } = res.data;
  localStorage.setItem('dpdp_token', token);
  localStorage.setItem('dpdp_user', JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem('dpdp_token');
  localStorage.removeItem('dpdp_user');
  window.location.href = '/login';
};

export const getToken  = () => localStorage.getItem('dpdp_token');
export const getUser   = () => { try { return JSON.parse(localStorage.getItem('dpdp_user')); } catch { return null; } };
export const isLoggedIn = () => !!getToken();

export default API;
