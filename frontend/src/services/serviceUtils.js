export const normalizeApiError = (error, fallbackMessage) => {
  if (error?.response?.data?.error) {
    throw new Error(error.response.data.error);
  }

  throw new Error(fallbackMessage);
};

export const sanitizeAppraisalPayload = (data) => {
  const clean = { ...data };

  delete clean.isPersisted;
  delete clean.fotosGeneralesMap;

  return clean;
};