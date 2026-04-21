import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const API_URL = `${API_BASE_URL}/api/appraisals`;

// ==============================
// AXIOS INSTANCE
// ==============================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// ==============================
// INTERCEPTOR (AUTENTICACIÓN)
// ==============================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==============================
// INTERCEPTOR (RESPUESTAS)
// ==============================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        console.warn('Sesión expirada, limpiando sesión');

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

// ==============================
// HELPERS
// ==============================

const sanitizePayload = (data) => {
  const clean = { ...data };

  // eliminar propiedades que no deben ir al backend
  delete clean.isPersisted;
  delete clean.fotosGeneralesMap;

  return clean;
};

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);

  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }

  throw new Error(defaultMessage);
};

// ==============================
// SERVICIOS
// ==============================

export const getAppraisals = async () => {
  try {
    const response = await api.get('/api/appraisals');

    return {
      ok: true,
      data: response.data.appraisals || []
    };
  } catch (error) {
    handleError(error, 'Error al obtener avalúos');
  }
};

export const getAppraisalById = async (id) => {
  try {
    const response = await api.get(`/api/appraisals/${id}`);

    return {
      ok: true,
      data: response.data.appraisal
    };
  } catch (error) {
    handleError(error, 'Error al obtener avalúo');
  }
};

export const createAppraisal = async (data) => {
  try {
    const payload = sanitizePayload(data);

    const response = await api.post('/api/appraisals', payload);

    return {
      ok: true,
      appraisalId: response.data.appraisalId
    };
  } catch (error) {
    handleError(error, 'Error al crear avalúo');
  }
};

export const updateAppraisal = async (id, data) => {
  try {
    const payload = sanitizePayload(data);

    const response = await api.put(`/api/appraisals/${id}`, payload);

    return {
      ok: true,
      appraisalId: response.data.appraisalId
    };
  } catch (error) {
    handleError(error, 'Error al actualizar avalúo');
  }
};

export const getAppraisalHistory = async (id) => {
  try {
    const response = await api.get(`/api/appraisals/${id}/history`);

    return {
      ok: true,
      data: response.data.historial || []
    };
  } catch (error) {
    handleError(error, 'Error al obtener historial del avalúo');
  }
};

export const downloadAppraisalPdf = async (id) => {
  try {
    const response = await api.get(`/api/appraisals/${id}/pdf`, {
      responseType: 'blob'
    });

    return {
      ok: true,
      blob: response.data
    };
  } catch (error) {
    handleError(error, 'Error al descargar PDF del avalúo');
  }
};