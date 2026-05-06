export const getSuccessMessageByStatus = (status) => {
  switch (status) {
    case 'incompleto':
      return 'Avalúo guardado como incompleto';
    case 'pendiente_validacion':
      return 'Avalúo enviado a validación';
    case 'comprado':
      return 'Compra confirmada';
    default:
      return 'Avalúo guardado correctamente';
  }
};

export const normalizeSearchText = (item) => {
  return [
    item.folio,
    item.clienteNombre,
    item.clienteTelefono,
    item.vehiculoInteres,
    item.asesorVentas
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export const withPersistedFlag = (appraisal) => ({
  ...appraisal,
  isPersisted: true
});

export const sanitizeAppraisalBeforeSave = (data, formatDateFn) => {
  const payload = {
    ...data,
    fechaActualizacion: formatDateFn()
  };

  delete payload.isPersisted;
  delete payload.fotosGeneralesMap;

  return payload;
};

export const getTotals = (appraisals) => {
  const total = appraisals.length;
  const incompletos = appraisals.filter((item) => item.estatus === 'incompleto').length;
  const pendientesValidacion = appraisals.filter((item) => item.estatus === 'pendiente_validacion').length;
  const comprados = appraisals.filter((item) => item.estatus === 'comprado').length;

  return {
    total,
    incompletos,
    pendientesValidacion,
    comprados
  };
};

export const filterAppraisals = (appraisals, search, effectiveStatusFilter) => {
  const normalizedSearch = search.toLowerCase();

  return appraisals.filter((item) => {
    const matchesSearch = normalizeSearchText(item).includes(normalizedSearch);
    const matchesStatus =
      effectiveStatusFilter === 'todos'
        ? true
        : item.estatus === effectiveStatusFilter;

    return matchesSearch && matchesStatus;
  });
};
