import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// ==============================
// AXIOS INSTANCE
// ==============================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
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
        console.warn('Sesión expirada durante operación de fotos');

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

export const uploadAppraisalPhoto = async ({
  appraisalId,
  photoType,
  slotKey,
  file
}) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photoType', photoType);

    if (slotKey) {
      formData.append('slotKey', slotKey);
    }

    const response = await api.post(
      `/api/appraisals/${appraisalId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      ok: true,
      file: response.data.file,
      message: response.data.message || 'Foto cargada correctamente'
    };
  } catch (error) {
    handleError(error, 'Error al subir foto');
  }
};

export const downloadAppraisalPhotosZip = async ({
  appraisalId,
  photoType
}) => {
  try {
    const response = await api.get(
      `/api/appraisals/${appraisalId}/photos/zip`,
      {
        params: { photoType },
        responseType: 'blob'
      }
    );

    return {
      ok: true,
      blob: response.data
    };
  } catch (error) {
    handleError(error, 'Error al descargar ZIP de fotos');
  }
};