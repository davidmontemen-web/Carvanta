export const sectionTitles = {
  frente: 'Frente',
  costadoIzquierdo: 'Costado izquierdo',
  costadoDerecho: 'Costado derecho',
  trasera: 'Parte trasera',
  techo: 'Techo',
  parabrisas: 'Parabrisas'
};

export const damageLabels = {
  pieza_repintada: 'Pieza repintada',
  rayon_leve: 'Rayón leve',
  rayon_profundo: 'Rayón profundo',
  pieza_rota: 'Pieza rota',
  pieza_con_pasta: 'Pieza con pasta',
  abolladura: 'Abolladura',
  golpe_fuerte: 'Golpe fuerte',
  parabrisas_estrellado: 'Parabrisas estrellado',
  parabrisas_roto: 'Parabrisas roto'
};

export const tirePositionLabels = {
  delanteraIzquierda: 'Delantera izquierda',
  delanteraDerecha: 'Delantera derecha',
  traseraIzquierda: 'Trasera izquierda',
  traseraDerecha: 'Trasera derecha'
};

export const tireStateLabels = {
  buen_estado: 'Buen estado',
  desgastada: 'Desgastada',
  seccionada: 'Seccionada',
  chipote: 'Chipote',
  rayado: 'Rayado',
  estrellado: 'Estrellado'
};

const yesNoNaLabels = {
  si: 'Sí',
  no: 'No',
  na: 'N/A'
};

const technicalLabels = {
  ok: 'OK',
  detalle: 'Detalle',
  na: 'N/A'
};

export const generalPhotoOrder = [
  'frontal',
  'frontalDerecha',
  'lateralDerecha',
  'traseraDerecha',
  'trasera',
  'traseraIzquierda',
  'lateralIzquierda',
  'frontalIzquierda',
  'interiorTablero',
  'motor'
];

export const generalPhotoLabels = {
  frontal: 'Frontal',
  frontalDerecha: 'Frontal derecha',
  lateralDerecha: 'Lateral derecha',
  traseraDerecha: 'Trasera derecha',
  trasera: 'Trasera',
  traseraIzquierda: 'Trasera izquierda',
  lateralIzquierda: 'Lateral izquierda',
  frontalIzquierda: 'Frontal izquierda',
  interiorTablero: 'Interior / tablero',
  motor: 'Motor'
};

export async function downloadPhoto(photo, fallbackName = 'foto.jpg') {
  try {
    const fileUrl = photo?.url || photo?.preview;
    if (!fileUrl) return;

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('No se pudo descargar la imagen');
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = photo.name || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Error al descargar foto:', error);
    alert('No se pudo descargar la imagen.');
  }
}

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(numeric);
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const formatHistoryDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const toDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

export const formatYesNoNa = (value) => yesNoNaLabels[value] || '-';
export const formatTechnical = (value) => technicalLabels[value] || '-';
export const formatDamage = (value) => damageLabels[value] || value;
export const formatTireState = (value) => tireStateLabels[value] || '-';

export const formatHistoryAction = (action) => {
  const labels = {
    CREATED: 'Avalúo creado',
    UPDATED: 'Avalúo actualizado',
    STATUS_CHANGED: 'Estatus modificado',
    COMPLETED_RECORD_EDITED: 'Administrador editó un avalúo completo',
    GENERAL_PHOTO_UPLOADED: 'Foto general agregada',
    DETAIL_PHOTO_UPLOADED: 'Foto de detalle agregada'
  };

  return labels[action] || action || '-';
};

export const getHistoryAccent = (action) => {
  const accents = {
    CREATED: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
    UPDATED: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
    STATUS_CHANGED: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    COMPLETED_RECORD_EDITED: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
    GENERAL_PHOTO_UPLOADED: { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
    DETAIL_PHOTO_UPLOADED: { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' }
  };

  return accents[action] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' };
};