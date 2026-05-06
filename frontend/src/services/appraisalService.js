import httpClient from './httpClient';
import { normalizeApiError, sanitizeAppraisalPayload } from './serviceUtils';

export const normalizeAppraisalStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (!value || value === 'borrador') return 'incompleto';
  if (value === 'completo') return 'pendiente_validacion';
  return value;
};

export const getAppraisals = async () => {
  try {
    const response = await httpClient.get('/api/appraisals');

    return {
      ok: true,
      data: (response.data.appraisals || []).map((item) => ({
        ...item,
        estatus: normalizeAppraisalStatus(item.estatus)
      }))
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
      data: {
        ...response.data.appraisal,
        estatus: normalizeAppraisalStatus(response.data.appraisal?.estatus)
      }
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

export const marcarComoComprado = async (id, dataActual) => {
  try {
    const payload = {
      ...dataActual,
      estatus: 'comprado'
    };

    const response = await httpClient.put(`/api/appraisals/${id}`, payload);

    return {
      ok: true,
      appraisalId: response.data.appraisalId
    };
  } catch (error) {
    normalizeApiError(error, 'Error al confirmar compra');
  }
};

export const getAppraisalFollowups = async (id) => {
  try {
    const response = await httpClient.get(`/api/appraisals/${id}/followups`);
    return { ok: true, data: response.data.followups || [] };
  } catch (error) {
    normalizeApiError(error, 'Error al obtener seguimientos comerciales');
  }
};

export const createAppraisalFollowup = async (id, data) => {
  try {
    const response = await httpClient.post(`/api/appraisals/${id}/followups`, data);
    return { ok: true, data: response.data };
  } catch (error) {
    normalizeApiError(error, 'Error al crear seguimiento comercial');
  }
};
