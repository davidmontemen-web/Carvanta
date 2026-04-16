import axios from 'axios';

const API_URL = 'http://localhost:4000/api/appraisals';

export const uploadAppraisalPhoto = async ({ appraisalId, photoType, slotKey, file }) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('photoType', photoType);

  if (slotKey) {
    formData.append('slotKey', slotKey);
  }

  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_URL}/${appraisalId}/photos`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};

export const downloadAppraisalPhotosZip = async ({ appraisalId, photoType }) => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_URL}/${appraisalId}/photos/zip`,
    {
      params: { photoType },
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};