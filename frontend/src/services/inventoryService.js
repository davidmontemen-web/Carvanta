import httpClient from './httpClient';
import { normalizeApiError } from './serviceUtils';

export const getInventory = async () => {
  try {
    const response = await httpClient.get('/api/inventario');

    return {
      ok: true,
      data: response.data.inventario || []
    };
  } catch (error) {
    normalizeApiError(error, 'Error al listar inventario');
  }

};

export const updateInventoryStatus = async (id, nuevoEstado) => {
  try {
    const response = await httpClient.patch(`/api/inventario/${id}/estado`, {
      nuevo_estado: nuevoEstado
    });

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    normalizeApiError(error, 'Error al actualizar estado de inventario');
  }
};

// 🔹 Obtener análisis de pricing
export const getInventoryPricing = async (id) => {
  const res = await fetch(`http://localhost:4000/api/inventario/${id}/pricing`);
  return res.json();
};

// 🔹 Agregar comparable
export const addInventoryComparable = async (id, data) => {
  const res = await fetch(`http://localhost:4000/api/inventario/${id}/comparables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

// 🔹 Asignar precio final
export const assignInventoryPrice = async (id, data) => {
  const res = await fetch(`http://localhost:4000/api/inventario/${id}/pricing/asignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getReconditioningExpenses = async (id) => {
  try {
    const response = await httpClient.get(`/api/inventario/${id}/reacondicionamiento`);

    return {
      ok: true,
      gastos: response.data.gastos || []
    };
  } catch (error) {
    normalizeApiError(error, 'Error al obtener gastos de reacondicionamiento');
  }
};

export const addReconditioningExpense = async (id, data) => {
  try {
    const response = await httpClient.post(
      `/api/inventario/${id}/reacondicionamiento/gastos`,
      data
    );

    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al agregar gasto de reacondicionamiento');
  }
};

export const deleteReconditioningExpense = async (id, gastoId) => {
  try {
    const response = await httpClient.delete(
      `/api/inventario/${id}/reacondicionamiento/gastos/${gastoId}`
    );

    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al eliminar gasto de reacondicionamiento');
  }
};

export const getInventoryPublications = async (id) => {
  try {
    const response = await httpClient.get(`/api/inventario/${id}/publicaciones`);
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al obtener publicaciones del inventario');
  }
};

export const publishInventory = async (id, data) => {
  try {
    const response = await httpClient.post(`/api/inventario/${id}/publicaciones/publicar`, data);
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al publicar inventario');
  }
};

export const retryInventoryPublication = async (id, publicationId) => {
  try {
    const response = await httpClient.post(
      `/api/inventario/${id}/publicaciones/${publicationId}/reintentar`
    );
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al reintentar publicación');
  }
};

export const updateInventoryPublicationStatus = async (id, publicationId, status) => {
  try {
    const response = await httpClient.patch(
      `/api/inventario/${id}/publicaciones/${publicationId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al actualizar estado de publicación');
  }
};

export const getPublicationChannelsConfig = async () => {
  try {
    const response = await httpClient.get('/api/inventario/publicaciones/config');
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al obtener configuración de canales');
  }
};

export const savePublicationChannelConfig = async (data) => {
  try {
    const response = await httpClient.post('/api/inventario/publicaciones/config', data);
    return response.data;
  } catch (error) {
    normalizeApiError(error, 'Error al guardar configuración del canal');
  }
};
