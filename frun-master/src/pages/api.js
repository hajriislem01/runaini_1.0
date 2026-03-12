import axios from 'axios';

// Instance avec token pour toutes les requêtes authentifiées
const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: { 'Content-Type': 'application/json' }
});

// Instance sans token, pour signup/login
export const API_NO_AUTH = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur : ajoute automatiquement le token pour API
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;