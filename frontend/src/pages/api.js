import axios from 'axios';

// Instance avec token pour toutes les requêtes authentifiées
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const API = axios.create({
  baseURL: BASE_URL,
});

// Instance sans token, pour signup/login
export const API_NO_AUTH = axios.create({
  baseURL: BASE_URL,
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