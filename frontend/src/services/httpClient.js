import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default httpClient;
export { API_BASE_URL };