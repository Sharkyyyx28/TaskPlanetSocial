import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);

export const getPosts = (sort = '') => api.get(`/posts${sort ? `?sort=${sort}` : ''}`);
export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const commentPost = (id, text) => api.post(`/posts/${id}/comment`, { text });

export default api;
