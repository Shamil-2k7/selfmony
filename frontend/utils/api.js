import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://selfmony-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the auth token to every request automatically
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Authentication
  login: async (username, password) => {
    const response = await API.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
    }
    return response.data;
  },
  signup: async (username, password) => {
    const response = await API.post('/auth/signup', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
    }
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const response = await API.get('/transactions', { params });
    return response.data;
  },
  createTransaction: async (data) => {
    const response = await API.post('/transactions', data);
    return response.data;
  },
  deleteTransaction: async (id) => {
    const response = await API.delete(`/transactions/${id}`);
    return response.data;
  },
  clearAllData: async () => {
    const response = await API.delete('/transactions');
    return response.data;
  },

  // Todos
  getTodos: async () => {
    const response = await API.get('/todos');
    return response.data;
  },
  createTodo: async (name) => {
    const response = await API.post('/todos', { name });
    return response.data;
  },
  toggleTodo: async (id, completed) => {
    const response = await API.put(`/todos/${id}`, { completed });
    return response.data;
  },
  deleteTodo: async (id) => {
    const response = await API.delete(`/todos/${id}`);
    return response.data;
  },
};

export default apiService;

