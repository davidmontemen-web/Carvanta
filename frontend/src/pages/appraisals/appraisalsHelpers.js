export const getSuccessMessageByStatus = (status) => {
  switch (status) {
    case 'borrador':
      return 'Avalúo guardado como borrador';
    case 'incompleto':
      return 'Avalúo guardado como incompleto';
    case 'completo':
      return 'Avalúo marcado como completo correctamente';
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
  const borradores = appraisals.filter((item) => item.estatus === 'borrador').length;
  const incompletos = appraisals.filter((item) => item.estatus === 'incompleto').length;
  const completos = appraisals.filter((item) => item.estatus === 'completo').length;

  return {
    total,
    borradores,
    incompletos,
    completos
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