import axios from 'axios';

const API_URL = 'http://localhost:4000/api/appraisals';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAppraisals = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const getAppraisalById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const createAppraisal = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeaders());
  return response.data;
};

export const updateAppraisal = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
  return response.data;
};