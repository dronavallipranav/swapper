import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tok = localStorage.getItem('token');

    if (!config.headers) {
        config.headers = {};
    }

    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    } else if (tok) {
      config.headers['Authorization'] = `Bearer ${tok}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status == 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        // Redirect to logout if not already on login page
        window.location.href = '/logout';
      }
    }
    return Promise.reject(error);
  }
);

export default api;