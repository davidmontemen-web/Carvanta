import httpClient from './httpClient';
import { normalizeApiError, sanitizeAppraisalPayload } from './serviceUtils';

export const getAppraisals = async () => {
  try {
    const response = await httpClient.get('/api/appraisals');

    return {
      ok: true,
      data: response.data.appraisals || []
    };
  } catch (error) {
    normalizeApiError(error, 'Error al obtener avalúos');
  }
};

export const getAppraisalById = async (id) => {
  try {
    const response = await httpClient.get(`/api/appraisals/${id}`);

    return {
      ok: true,
      data: response.data.appraisal
    };
  } catch (error) {
    normalizeApiError(error, 'Error al obtener avalúo');
  }
};

export const createAppraisal = async (data) => {
  try {
    const payload = sanitizeAppraisalPayload(data);
    const response = await httpClient.post('/api/appraisals', payload);

    return {
      ok: true,
      appraisalId: response.data.appraisalId
    };
  } catch (error) {
    normalizeApiError(error, 'Error al crear avalúo');
  }
};

export const updateAppraisal = async (id, data) => {
  try {
    const payload = sanitizeAppraisalPayload(data);
    const response = await httpClient.put(`/api/appraisals/${id}`, payload);

    return {
      ok: true,
      appraisalId: response.data.appraisalId
    };
  } catch (error) {
    normalizeApiError(error, 'Error al actualizar avalúo');
  }
};

export const getAppraisalHistory = async (id) => {
  try {
    const response = await httpClient.get(`/api/appraisals/${id}/history`);

    return {
      ok: true,
      data: response.data.historial || []
    };
  } catch (error) {
    normalizeApiError(error, 'Error al obtener historial del avalúo');
  }
};

export const downloadAppraisalPdf = async (id) => {
  try {
    const response = await httpClient.get(`/api/appraisals/${id}/pdf`, {
      responseType: 'blob'
    });

    return {
      ok: true,
      blob: response.data
    };
  } catch (error) {
    normalizeApiError(error, 'Error al descargar PDF del avalúo');
  }
};