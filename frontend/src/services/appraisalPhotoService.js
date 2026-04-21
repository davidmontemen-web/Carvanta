import httpClient from './httpClient';
import { normalizeApiError } from './serviceUtils';

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

    const response = await httpClient.post(
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
    normalizeApiError(error, 'Error al subir foto');
  }
};

export const downloadAppraisalPhotosZip = async ({
  appraisalId,
  photoType
}) => {
  try {
    const response = await httpClient.get(
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
    normalizeApiError(error, 'Error al descargar ZIP de fotos');
  }
};