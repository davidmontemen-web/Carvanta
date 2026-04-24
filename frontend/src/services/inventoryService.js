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