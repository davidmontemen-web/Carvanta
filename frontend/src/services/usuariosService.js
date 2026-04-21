import httpClient from './httpClient';

const ENDPOINT = '/api/usuarios';

const normalizeError = (error, fallbackMessage) => {
  if (error?.response?.data?.error) {
    throw new Error(error.response.data.error);
  }

  throw new Error(fallbackMessage);
};

export const obtenerUsuarios = async () => {
  try {
    const { data } = await httpClient.get(ENDPOINT);
    return data;
  } catch (error) {
    normalizeError(error, 'Error al obtener usuarios');
  }
};

export const crearUsuario = async (payload) => {
  try {
    const { data } = await httpClient.post(ENDPOINT, payload);
    return data;
  } catch (error) {
    normalizeError(error, 'Error al crear usuario');
  }
};

export const cambiarEstadoUsuario = async (id, activo) => {
  try {
    const { data } = await httpClient.patch(`${ENDPOINT}/${id}/estado`, { activo });
    return data;
  } catch (error) {
    normalizeError(error, 'Error al cambiar estado de usuario');
  }
};