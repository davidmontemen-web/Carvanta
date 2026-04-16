import axios from 'axios';

const API_URL = 'http://localhost:4000/api/usuarios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const obtenerUsuarios = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const crearUsuario = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeaders());
  return response.data;
};

export const cambiarEstadoUsuario = async (id, activo) => {
  const response = await axios.patch(
    `${API_URL}/${id}/estado`,
    { activo },
    getAuthHeaders()
  );
  return response.data;
};