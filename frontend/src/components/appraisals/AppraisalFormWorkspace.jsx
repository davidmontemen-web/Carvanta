import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadAppraisalPhoto } from '../../services/appraisalPhotoService';


const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateInputValue = (value) => {
  if (!value) return getTodayLocalDate();

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getTodayLocalDate();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
const parseCurrencyNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calculateMediaValue = (tomaLibro, ventaLibro) => {
  const toma = parseCurrencyNumber(tomaLibro);
  const venta = parseCurrencyNumber(ventaLibro);

  if (!toma || !venta || venta < toma) return '';

  const media = ((venta - toma) / 2) + toma;
  return String(Math.round(media));
};

const formatMoneyDisplay = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const numeric = parseCurrencyNumber(value);
  if (!numeric && numeric !== 0) return '';
  return new Intl.NumberFormat('es-MX').format(numeric);
};

const sections = [
  { key: 'encabezado', label: 'Encabezado' },
  { key: 'generales', label: 'Generales del vehículo' },
  { key: 'documentacion', label: 'Documentación' },
  { key: 'interior', label: 'Aspecto físico interior' },
  { key: 'carroceria', label: 'Carrocería y neumáticos' },
  { key: 'sistemaElectrico', label: 'Sistema eléctrico' },
  { key: 'fugasMotor', label: 'Fugas y motor' },
  { key: 'valuacion', label: 'Valuación' },
  { key: 'fotosGenerales', label: 'Fotos generales' },
  { key: 'fotosDetalle', label: 'Fotos de detalle' },
  { key: 'revisionFinal', label: 'Revisión final' }
];

const generalPhotoSlots = [
  { key: 'frontal', label: 'Frontal' },
  { key: 'frontalDerecha', label: 'Frontal derecha' },
  { key: 'lateralDerecha', label: 'Lateral derecha' },
  { key: 'traseraDerecha', label: 'Trasera derecha' },
  { key: 'trasera', label: 'Trasera' },
  { key: 'traseraIzquierda', label: 'Trasera izquierda' },
  { key: 'lateralIzquierda', label: 'Lateral izquierda' },
  { key: 'frontalIzquierda', label: 'Frontal izquierda' },
  { key: 'interiorTablero', label: 'Interior tablero' },
  { key: 'motor', label: 'Motor' }
];

const carroceriaDamageOptions = [
  { value: 'pieza_repintada', label: 'Pieza repintada' },
  { value: 'rayon_leve', label: 'Rayón leve' },
  { value: 'rayon_profundo', label: 'Rayón profundo' },
  { value: 'pieza_rota', label: 'Pieza rota' },
  { value: 'pieza_con_pasta', label: 'Pieza con pasta' },
  { value: 'abolladura', label: 'Abolladura' },
  { value: 'golpe_fuerte', label: 'Golpe fuerte' },
  { value: 'parabrisas_estrellado', label: 'Parabrisas estrellado' },
  { value: 'parabrisas_roto', label: 'Parabrisas roto' }
];

const neumaticoOptions = [
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'desgastada', label: 'Desgastada' },
  { value: 'seccionada', label: 'Seccionada' },
  { value: 'chipote', label: 'Chipote' }
];

const rinOptions = [
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'rayado', label: 'Rayado' },
  { value: 'estrellado', label: 'Estrellado' }
];

const carroceriaZones = [
  { key: 'frente', label: 'Frente' },
  { key: 'costadoIzquierdo', label: 'Costado izquierdo' },
  { key: 'costadoDerecho', label: 'Costado derecho' },
  { key: 'trasera', label: 'Parte trasera' },
  { key: 'techo', label: 'Techo' },
  { key: 'parabrisas', label: 'Parabrisas' }
];

const neumaticoPositions = [
  { key: 'delanteraIzquierda', label: 'Delantera izquierda' },
  { key: 'delanteraDerecha', label: 'Delantera derecha' },
  { key: 'traseraIzquierda', label: 'Trasera izquierda' },
  { key: 'traseraDerecha', label: 'Trasera derecha' }
];

const createEmptyGeneralPhotosMap = () => {
  const map = {};
  generalPhotoSlots.forEach((slot) => {
    map[slot.key] = null;
  });
  return map;
};

const createEmptyForm = () => ({
  id: null,
  folio: '',
  clienteNombre: '',
  clienteTelefono: '',
  vehiculoInteres: '',
  fechaAvaluo: getTodayLocalDate(),
  fechaActualizacion: getTodayLocalDate(),
  estatus: 'borrador',
  asesorVentas: '',
  isPersisted: false,
  generales: {
  marca: '',
  submarca: '',
  version: '',
  transmision: '',
  numeroSerie: '',
  anio: '',
  color: '',
  kilometraje: '',
  numeroDuenos: '',
  placas: '',
  comentarios: ''
},
  documentacion: {
  factura: '',
  cartaOrigen: '',
  tenencias: '',
  ultimoServicio: '',
  verificacion: '',
  manuales: '',
  garantia: '',
  engomado: '',
  tarjetaCirculacion: '',
  polizaSeguro: '',
  comentarios: ''
},
  interior: {
  vestiduras: '',
  cielo: '',
  consolaCentral: '',
  alfombras: '',
  tablero: '',
  encendedor: '',
  puertasLaterales: '',
  volante: '',
  comentarios: ''
},
  carroceria: {
  zonas: {
    frente: [],
    costadoIzquierdo: [],
    costadoDerecho: [],
    trasera: [],
    techo: [],
    parabrisas: []
  },
  neumaticos: {
    delanteraIzquierda: { neumatico: '', rin: '' },
    delanteraDerecha: { neumatico: '', rin: '' },
    traseraIzquierda: { neumatico: '', rin: '' },
    traseraDerecha: { neumatico: '', rin: '' }
  },
  observaciones: ''
},
  sistemaElectrico: {
    espejosElectricos: '',
  bolsasAire: '',
  aireAcondicionado: '',
  controlCrucero: '',
  chisguetero: '',
  luzMapa: '',

  controlesVolante: '',
  checkEngine: '',
  asientosElectricos: '',
  encendedor: '',
  claxon: '',

  lucesInternas: '',
  segurosElectricos: '',
  cristalesElectricos: '',
  aperturaCajuela: '',
  pantalla: '',
  farosNiebla: '',

  lucesExternas: '',
  limpiadores: '',
  estereoUsb: '',
  quemacocos: '',
  testigos: '',
  direccionales: '',

  comentarios: ''
},
  fugasMotor: {
  motor: '',
  transmision: '',
  sistemaFrenos: '',
  direccionHidraulica: '',
  amortiguadores: '',
  anticongelante: '',
  aireAcondicionado: '',
  flechas: '',
  soportesMotor: '',
  soportesCaja: '',
  comentarios: ''
},
  valuacion: {
  tomaLibro: '',
  ventaLibro: '',
  reparaciones: '',
  tomaAutorizada: '',
  media: '',
  comentarios: ''
},
  fotosGeneralesMap: createEmptyGeneralPhotosMap(),
  fotosDetalle: []
});

const normalizeInitialData = (initialData) => {
  const base = createEmptyForm();
  const source = initialData || {};
  const generalPhotosMap = createEmptyGeneralPhotosMap();
  const normalizedFechaAvaluo = toDateInputValue(source?.fechaAvaluo);
  const normalizedFechaActualizacion = toDateInputValue(source?.fechaActualizacion);

  const normalizedGenerales = {
    ...(source.generales || {}),
    marca: source?.generales?.marca ?? '',
    submarca: source?.generales?.submarca ?? source?.generales?.subMarca ?? '',
    version: source?.generales?.version ?? '',
    transmision: source?.generales?.transmision ?? '',
    numeroSerie: source?.generales?.numeroSerie ?? '',
    anio: source?.generales?.anio ?? source?.generales?.anioModelo ?? '',
    color: source?.generales?.color ?? '',
    kilometraje: source?.generales?.kilometraje ?? '',
    numeroDuenos:
      source?.generales?.numeroDuenos ?? source?.generales?.numeroDuenios ?? '',
    placas: source?.generales?.placas ?? '',
    comentarios: source?.generales?.comentarios ?? ''
  };
  
  const normalizedValuacion = {
  ...(source.valuacion || {}),
  tomaLibro: source?.valuacion?.tomaLibro ?? '',
  ventaLibro: source?.valuacion?.ventaLibro ?? '',
  reparaciones: source?.valuacion?.reparaciones ?? '',
  tomaAutorizada: source?.valuacion?.tomaAutorizada ?? '',
  media:
    source?.valuacion?.media ??
    calculateMediaValue(
      source?.valuacion?.tomaLibro,
      source?.valuacion?.ventaLibro
    ),
  comentarios: source?.valuacion?.comentarios ?? ''
};

  if (Array.isArray(source?.fotosGenerales)) {
    source.fotosGenerales.forEach((item, index) => {
      if (item?.slotKey) {
        generalPhotosMap[item.slotKey] = {
          ...item,
          preview: item.url || item.preview || ''
        };
      } else {
        const slot = generalPhotoSlots[index];
        if (slot) {
          generalPhotosMap[slot.key] = {
            ...item,
            preview: item.url || item.preview || ''
          };
        }
      }
    });
  }

  return {
  ...base,
  ...source,
  fechaAvaluo: normalizedFechaAvaluo,
  fechaActualizacion: normalizedFechaActualizacion,
  isPersisted: source?.isPersisted === true,
    generales: {
  ...base.generales,
  ...normalizedGenerales
},
    documentacion: {
      ...base.documentacion,
      ...(source.documentacion || {})
    },
    interior: {
      ...base.interior,
      ...(source.interior || {})
    },
    carroceria: {
  ...base.carroceria,
  ...(source.carroceria || {}),
  zonas: {
    ...base.carroceria.zonas,
    ...(source?.carroceria?.zonas || {})
  },
  neumaticos: {
    ...base.carroceria.neumaticos,
    ...(source?.carroceria?.neumaticos || {})
  }
},
    sistemaElectrico: {
      ...base.sistemaElectrico,
      ...(source.sistemaElectrico || {})
    },
    fugasMotor: {
      ...base.fugasMotor,
      ...(source.fugasMotor || {})
    },
    valuacion: {
  ...base.valuacion,
  ...normalizedValuacion
},
    fotosGeneralesMap: generalPhotosMap,
    fotosDetalle: Array.isArray(source?.fotosDetalle)
      ? source.fotosDetalle.map((item) => ({
          ...item,
          preview: item.url || item.preview || ''
        }))
      : []
  };
};

const buildPayloadFromForm = (form, generalPhotosArray) => ({
  id: form.id,
  folio: form.folio,
  clienteNombre: form.clienteNombre,
  clienteTelefono: form.clienteTelefono,
  vehiculoInteres: form.vehiculoInteres,
  fechaAvaluo: toDateInputValue(form.fechaAvaluo),
  fechaActualizacion: getTodayLocalDate(),
  estatus: form.estatus,
  asesorVentas: form.asesorVentas,
  generales: form.generales,
  documentacion: form.documentacion,
  interior: form.interior,
  carroceria: form.carroceria,
  sistemaElectrico: form.sistemaElectrico,
  fugasMotor: form.fugasMotor,
  valuacion: form.valuacion,
  fotosGenerales: generalPhotosArray,
  fotosDetalle: form.fotosDetalle,
  media: form.valuacion.media
});

const hasValue = (value) => String(value ?? '').trim() !== '';

const formatPhoneDigits = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 10);

const formatPhoneDisplay = (value) => {
  const digits = formatPhoneDigits(value);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

const normalizeTextValue = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trimStart();

const normalizeUppercase = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const normalizeTitle = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());    

const toTitleCase = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getValidation = (form, generalPhotosArray) => {
  const missingHeaderFields = [];
if (!hasValue(form.folio)) missingHeaderFields.push('Folio');
if (!hasValue(form.fechaAvaluo)) missingHeaderFields.push('Fecha de avalúo');
if (!hasValue(form.asesorVentas)) missingHeaderFields.push('Asesor de ventas');
if (!hasValue(form.clienteNombre)) missingHeaderFields.push('Nombre del cliente');
if (formatPhoneDigits(form.clienteTelefono).length !== 10) {
  missingHeaderFields.push('Teléfono (10 dígitos)');
}
if (!hasValue(form.vehiculoInteres)) missingHeaderFields.push('Vehículo de interés');

  const missingGeneralesFields = [];

if (!hasValue(form.generales.marca)) missingGeneralesFields.push('Marca');
if (!hasValue(form.generales.submarca)) missingGeneralesFields.push('Submarca');
if (!hasValue(form.generales.version)) missingGeneralesFields.push('Versión');
if (!hasValue(form.generales.anio)) missingGeneralesFields.push('Año modelo');
if (!hasValue(form.generales.transmision)) missingGeneralesFields.push('Transmisión');
if (!hasValue(form.generales.color)) missingGeneralesFields.push('Color');
if (!hasValue(form.generales.kilometraje)) missingGeneralesFields.push('Kilometraje');
if (!hasValue(form.generales.numeroDuenos)) missingGeneralesFields.push('Número de dueños');

const missingInteriorFields = [];

if (!hasValue(form.interior.vestiduras)) missingInteriorFields.push('Vestiduras');
if (!hasValue(form.interior.cielo)) missingInteriorFields.push('Cielo');
if (!hasValue(form.interior.consolaCentral)) missingInteriorFields.push('Consola central');
if (!hasValue(form.interior.alfombras)) missingInteriorFields.push('Alfombras');
if (!hasValue(form.interior.tablero)) missingInteriorFields.push('Tablero');
if (!hasValue(form.interior.encendedor)) missingInteriorFields.push('Encendedor / toma corriente');
if (!hasValue(form.interior.puertasLaterales)) missingInteriorFields.push('Puertas / vestiduras laterales');
if (!hasValue(form.interior.volante)) missingInteriorFields.push('Volante');

const missingFugasMotorFields = [];

if (!hasValue(form.fugasMotor.motor)) missingFugasMotorFields.push('Motor');
if (!hasValue(form.fugasMotor.transmision)) missingFugasMotorFields.push('Transmisión');
if (!hasValue(form.fugasMotor.sistemaFrenos)) missingFugasMotorFields.push('Sistema de frenos');
if (!hasValue(form.fugasMotor.direccionHidraulica)) missingFugasMotorFields.push('Dirección hidráulica');
if (!hasValue(form.fugasMotor.amortiguadores)) missingFugasMotorFields.push('Amortiguadores');
if (!hasValue(form.fugasMotor.anticongelante)) missingFugasMotorFields.push('Anticongelante');
if (!hasValue(form.fugasMotor.aireAcondicionado)) missingFugasMotorFields.push('Aire acondicionado');
if (!hasValue(form.fugasMotor.flechas)) missingFugasMotorFields.push('Flechas');
if (!hasValue(form.fugasMotor.soportesMotor)) missingFugasMotorFields.push('Soportes de motor');
if (!hasValue(form.fugasMotor.soportesCaja)) missingFugasMotorFields.push('Soportes de caja');

  const missingValuacionFields = [];
if (!hasValue(form.valuacion.tomaLibro)) missingValuacionFields.push('Toma libro');
if (!hasValue(form.valuacion.ventaLibro)) missingValuacionFields.push('Venta libro');
if (!hasValue(form.valuacion.reparaciones) && form.valuacion.reparaciones !== '0') {
  missingValuacionFields.push('Reparaciones');
}
if (!hasValue(form.valuacion.tomaAutorizada)) {
  missingValuacionFields.push('Toma autorizada');
}

  const missingGeneralesForComplete = [];

if (!hasValue(form.generales.numeroSerie)) {
  missingGeneralesForComplete.push('Número de serie');
}

if (!hasValue(form.generales.placas)) {
  missingGeneralesForComplete.push('Placas');
}
const missingCarroceriaCompleteFields = [];

neumaticoPositions.forEach(({ key, label }) => {
  const current = form.carroceria?.neumaticos?.[key] || {};

  if (!hasValue(current.neumatico)) {
    missingCarroceriaCompleteFields.push(`Neumático ${label}`);
  }

  if (!hasValue(current.rin)) {
    missingCarroceriaCompleteFields.push(`Rin ${label}`);
  }
});

  const loadedGeneralSlots = generalPhotoSlots.filter(
    (slot) => form.fotosGeneralesMap?.[slot.key]
  ).length;

  const missingPhotoRequirements = [];
  if (loadedGeneralSlots < 7) {
    missingPhotoRequirements.push(`Fotos generales (${loadedGeneralSlots}/7 mín.)`);
  }
  if ((form.fotosDetalle || []).length < 1) {
    missingPhotoRequirements.push('Al menos 1 foto de detalle');
  }

  return {
    requiredHeader: missingHeaderFields.length === 0,
    requiredGenerales: missingGeneralesFields.length === 0,
    requiredValuacion: missingValuacionFields.length === 0,
    requiredPhotos: missingPhotoRequirements.length === 0,
    missingHeaderFields,
    missingGeneralesFields,
    missingValuacionFields,
    missingPhotoRequirements,
    missingFugasMotorFields,
    missingGeneralesForComplete,
missingInteriorFields,
missingCarroceriaCompleteFields,
    canComplete:
      missingHeaderFields.length === 0 &&
      missingGeneralesFields.length === 0 &&
      missingValuacionFields.length === 0 &&
      missingGeneralesForComplete.length === 0 &&
      missingInteriorFields.length === 0 &&
      missingCarroceriaCompleteFields.length === 0 &&
      missingFugasMotorFields.length === 0 &&
      missingPhotoRequirements.length === 0
  };
};

function AppraisalSection({
  sectionKey,
  title,
  subtitle,
  activeSection,
  sectionRefs,
  renderSectionStatus,
  children
}) {
  return (
    <section
      ref={(el) => {
        sectionRefs.current[sectionKey] = el;
      }}
      style={{
        ...styles.sectionCard,
        ...(activeSection === sectionKey ? styles.sectionCardActive : {})
      }}
    >
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {subtitle ? <p style={styles.helperText}>{subtitle}</p> : null}
        </div>
        {renderSectionStatus(sectionKey)}
      </div>
      {children}
    </section>
  );
}

export default function AppraisalFormWorkspace({
  mode,
  initialData,
  onBack,
  onSaveDraft,
  onMarkComplete,
  saving = false
}) {
  
  const normalizedInitialData = useMemo(
    () => normalizeInitialData(initialData),
    [initialData]
  );

  const [form, setForm] = useState(normalizedInitialData);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('encabezado');

  const sectionRefs = useRef({});
  const generalInputRefs = useRef({});
  const detailInputRef = useRef(null);

  useEffect(() => {
    setForm(normalizedInitialData);
  }, [normalizedInitialData]);

  useEffect(() => {
  if (!notification) return;
  const timer = setTimeout(() => setNotification(null), 5000);
  return () => clearTimeout(timer);
}, [notification]);

  const generalPhotosArray = useMemo(() => {
    return generalPhotoSlots
      .map((slot) => form.fotosGeneralesMap?.[slot.key])
      .filter(Boolean);
  }, [form.fotosGeneralesMap]);

  const validation = useMemo(() => {
    return getValidation(form, generalPhotosArray);
  }, [form, generalPhotosArray]);

  const scrollToSection = (key) => {
    setActiveSection(key);
    sectionRefs.current[key]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const updateRootField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClienteChange = (e) => {
  const value = normalizeTextValue(e.target.value);
  updateRootField('clienteNombre', value);
};

const handleClienteBlur = () => {
  updateRootField('clienteNombre', toTitleCase(form.clienteNombre));
};

const handleTelefonoChange = (e) => {
  updateRootField('clienteTelefono', formatPhoneDigits(e.target.value));
};

const handleVehiculoInteresChange = (e) => {
  const value = normalizeTextValue(e.target.value);
  updateRootField('vehiculoInteres', value);
};

  const updateSectionField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const handleValuacionNumberChange = (field, value) => {
  const numeric = String(value ?? '').replace(/\D/g, '');

  setForm((prev) => {
    const nextValuacion = {
      ...prev.valuacion,
      [field]: numeric
    };

    nextValuacion.media = calculateMediaValue(
      nextValuacion.tomaLibro,
      nextValuacion.ventaLibro
    );

    return {
      ...prev,
      valuacion: nextValuacion
    };
  });
};

  const toggleCarroceriaDamage = (zoneKey, damageValue) => {
  setForm((prev) => {
    const current = prev.carroceria?.zonas?.[zoneKey] || [];
    const exists = current.includes(damageValue);

    return {
      ...prev,
      carroceria: {
        ...prev.carroceria,
        zonas: {
          ...prev.carroceria.zonas,
          [zoneKey]: exists
            ? current.filter((item) => item !== damageValue)
            : [...current, damageValue]
        }
      }
    };
  });
};

const updateNeumaticoField = (positionKey, field, value) => {
  setForm((prev) => ({
    ...prev,
    carroceria: {
      ...prev.carroceria,
      neumaticos: {
        ...prev.carroceria.neumaticos,
        [positionKey]: {
          ...prev.carroceria.neumaticos[positionKey],
          [field]: value
        }
      }
    }
  }));
};

  const handleGeneralTextChange = (field, value) => {
  updateSectionField('generales', field, normalizeTextValue(value));
};

const handleGeneralUppercase = (field, value) => {
  updateSectionField('generales', field, normalizeUppercase(value));
};

const handleGeneralTitle = (field, value) => {
  updateSectionField('generales', field, normalizeTitle(value));
};

const handleKilometrajeChange = (value) => {
  const numeric = String(value ?? '').replace(/\D/g, '');
  updateSectionField('generales', 'kilometraje', numeric);
};

const handleAnioChange = (value) => {
  const numeric = String(value ?? '').replace(/\D/g, '').slice(0, 4);
  updateSectionField('generales', 'anio', numeric);
};

  const handleCheckboxField = (section, field) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: !prev?.[section]?.[field]
      }
    }));
  };

  const buildPayload = () => buildPayloadFromForm(form, generalPhotosArray);

  const ensureHeaderBeforeAnySave = () => {
  if (validation.requiredHeader) return true;

  showNotification(
  'warning',
  `Completa el encabezado para continuar. Faltan: ${validation.missingHeaderFields.join(', ')}.`
);
  scrollToSection('encabezado');
  return false;
};

  const ensureHeaderBeforeUpload = () => {
  if (validation.requiredHeader) return true;

  showNotification(
    'warning',
    `Primero completa el encabezado. Faltan: ${validation.missingHeaderFields.join(', ')}.`
  );
  scrollToSection('encabezado');
  return false;
};

  const persistDraftIfNeeded = async () => {
    const payload = {
      ...buildPayload(),
      estatus: 'borrador'
    };

    const result = await onSaveDraft(payload);

    if (!result?.ok || !result?.appraisal) {
      throw new Error('No se pudo guardar el borrador');
    }

    const normalizedSaved = normalizeInitialData({
      ...result.appraisal,
      isPersisted: true
    });

    setForm(normalizedSaved);
    return normalizedSaved.id;
  };

  const handleGeneralPhotoClick = (slotKey) => {
    if (!ensureHeaderBeforeUpload()) return;
    generalInputRefs.current[slotKey]?.click();
  };

  const handleGeneralPhotoChange = async (slotKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ensureHeaderBeforeUpload()) {
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);

      const appraisalId = form.isPersisted && form.id ? form.id : await persistDraftIfNeeded();

      const res = await uploadAppraisalPhoto({
        appraisalId,
        photoType: 'general',
        slotKey,
        file
      });

      const uploaded = {
        slotKey,
        name: res?.file?.name || file.name,
        preview: res?.file?.url || '',
        url: res?.file?.url || '',
        fileName: res?.file?.fileName,
        path: res?.file?.path,
        mimeType: res?.file?.mimeType
      };

      setForm((prev) => ({
        ...prev,
        id: appraisalId,
        isPersisted: true,
        fotosGeneralesMap: {
          ...prev.fotosGeneralesMap,
          [slotKey]: uploaded
        }
      }));

      showNotification('success', res?.message || 'Foto general cargada correctamente.');
    } catch (err) {
      console.error(err);
      showNotification('error', err.message || 'Error al subir foto general.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleAddDetailPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (!ensureHeaderBeforeUpload()) {
      if (detailInputRef.current) detailInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);

      const appraisalId = form.isPersisted && form.id ? form.id : await persistDraftIfNeeded();
      const uploadedPhotos = [];

      for (const file of files) {
        const res = await uploadAppraisalPhoto({
          appraisalId,
          photoType: 'detail',
          file
        });

        uploadedPhotos.push({
          name: res?.file?.name || file.name,
          preview: res?.file?.url || '',
          url: res?.file?.url || '',
          fileName: res?.file?.fileName,
          path: res?.file?.path,
          mimeType: res?.file?.mimeType
        });
      }

      setForm((prev) => ({
        ...prev,
        id: appraisalId,
        isPersisted: true,
        fotosDetalle: [...prev.fotosDetalle, ...uploadedPhotos]
      }));

      showNotification('success', 'Fotos de detalle cargadas correctamente.');
    } catch (err) {
      console.error(err);
      showNotification('error', err.message || 'Error al subir fotos de detalle.');
    } finally {
      setUploading(false);
      if (detailInputRef.current) {
        detailInputRef.current.value = '';
      }
    }
  };

  const removeGeneralPhoto = (slotKey) => {
    setForm((prev) => ({
      ...prev,
      fotosGeneralesMap: {
        ...prev.fotosGeneralesMap,
        [slotKey]: null
      }
    }));
  };

  const removeDetailPhoto = (index) => {
    setForm((prev) => ({
      ...prev,
      fotosDetalle: prev.fotosDetalle.filter((_, i) => i !== index)
    }));
  };



  const handleSaveDraft = async () => {
  if (!ensureHeaderBeforeAnySave()) return;

  try {
    const payload = {
      ...buildPayload(),
      estatus: 'borrador'
    };

    const result = await onSaveDraft(payload);

    if (!result?.ok || !result?.appraisal) {
      showNotification(
        'error',
        result?.message || 'No se pudo guardar el borrador. Revisa la información e intenta nuevamente.'
      );
      return;
    }

    setForm(
      normalizeInitialData({
        ...result.appraisal,
        isPersisted: true
      })
    );

    showNotification('success', 'Borrador guardado correctamente.');
  } catch (error) {
    console.error(error);
    showNotification('error', 'Ocurrió un error al guardar el borrador.');
  }
};

  

  const handleSaveAppraisal = async () => {
  if (!ensureHeaderBeforeAnySave()) return;

  if (!validation.canComplete) {
    const warnings = [
      ...validation.missingGeneralesFields.map((item) => `Generales: ${item}`),
      ...validation.missingValuacionFields.map((item) => `Valuación: ${item}`),
      ...validation.missingFugasMotorFields.map((item) => `Fugas y motor: ${item}`),
      ...validation.missingCarroceriaCompleteFields.map((item) => `Carrocería/Neumáticos: ${item}`),
      ...validation.missingPhotoRequirements.map((item) => `Fotos: ${item}`)
    ];

    const firstMissingSection = validation.missingGeneralesFields.length
  ? 'generales'
  : validation.missingInteriorFields.length
  ? 'interior'
  : validation.missingCarroceriaCompleteFields.length
  ? 'carroceria'
  : validation.missingFugasMotorFields.length
  ? 'fugasMotor'
  : validation.missingValuacionFields.length
  ? 'valuacion'
  : 'fotosGenerales';

    scrollToSection(firstMissingSection);
    showNotification(
      'warning',
      `No se puede guardar el avalúo. Falta completar: ${warnings.join(' | ')}`
    );
    return;
  }

  try {
    const payload = {
      ...buildPayload(),
      estatus: 'completo'
    };

    if (typeof onMarkComplete !== 'function') {
      showNotification('error', 'No está configurada la acción para guardar el avalúo.');
      return;
    }

    const result = await onMarkComplete(payload);

    if (!result?.ok || !result?.appraisal) {
      showNotification(
        'error',
        result?.message || 'No se pudo guardar el avalúo. Intenta nuevamente.'
      );
      return;
    }

    setForm(
      normalizeInitialData({
        ...result.appraisal,
        isPersisted: true
      })
    );

    showNotification('success', 'Avalúo guardado correctamente.');
  } catch (error) {
    console.error(error);
    showNotification('error', 'Ocurrió un error al guardar el avalúo.');
  }
};

  const renderSectionStatus = (key) => {
    const map = {
      encabezado: validation.requiredHeader,
      generales: validation.requiredGenerales,
      valuacion: validation.requiredValuacion,
      fotosGenerales: validation.requiredPhotos,
      fotosDetalle: validation.requiredPhotos
    };

    if (!(key in map)) return null;

    const ok = map[key];
    return (
      <span
        style={{
          ...styles.navStatus,
          ...(ok ? styles.navStatusOk : styles.navStatusPending)
        }}
      >
        {ok ? 'OK' : 'Pendiente'}
      </span>
    );
  };

  const renderField = (label, value, onChange, type = 'text', placeholder = '') => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.input}
    />
  </div>
);

const renderYesNoField = (label, value, onChange) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('si')}
        style={{
          ...styles.toggleButton,
          ...(value === 'si' ? styles.toggleYesActive : {})
        }}
      >
        ✔
      </button>

      <button
        type="button"
        onClick={() => onChange('no')}
        style={{
          ...styles.toggleButton,
          ...(value === 'no' ? styles.toggleNoActive : {})
        }}
      >
        ✖
      </button>
    </div>
  </div>
);

const renderYesNoNAField = (label, value, onChange) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('si')}
        style={{
          ...styles.toggleButton,
          ...(value === 'si' ? styles.toggleYesActive : {})
        }}
        title="Sí"
      >
        ✔
      </button>

      <button
        type="button"
        onClick={() => onChange('no')}
        style={{
          ...styles.toggleButton,
          ...(value === 'no' ? styles.toggleNoActive : {})
        }}
        title="No"
      >
        ✖
      </button>

      <button
        type="button"
        onClick={() => onChange('na')}
        style={{
          ...styles.toggleButton,
          ...(value === 'na' ? styles.toggleNAActive : {})
        }}
        title="No aplica"
      >
        —
      </button>
    </div>
  </div>
);

const renderConditionField = (label, value, onChange) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.conditionGroup}>
      <button
        type="button"
        onClick={() => onChange('excelente')}
        style={{
          ...styles.conditionButton,
          ...(value === 'excelente' ? styles.conditionExcellent : {})
        }}
      >
        Excelente
      </button>

      <button
        type="button"
        onClick={() => onChange('bueno')}
        style={{
          ...styles.conditionButton,
          ...(value === 'bueno' ? styles.conditionGood : {})
        }}
      >
        Bueno
      </button>

      <button
        type="button"
        onClick={() => onChange('regular')}
        style={{
          ...styles.conditionButton,
          ...(value === 'regular' ? styles.conditionRegular : {})
        }}
      >
        Regular
      </button>

      <button
        type="button"
        onClick={() => onChange('malo')}
        style={{
          ...styles.conditionButton,
          ...(value === 'malo' ? styles.conditionBad : {})
        }}
      >
        Malo
      </button>
    </div>
  </div>
);

const renderTechnicalStatusField = (label, value, onChange) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('ok')}
        style={{
          ...styles.toggleButton,
          ...(value === 'ok' ? styles.toggleYesActive : {})
        }}
        title="OK"
      >
        OK
      </button>

      <button
        type="button"
        onClick={() => onChange('detalle')}
        style={{
          ...styles.toggleButton,
          ...(value === 'detalle' ? styles.toggleNoActive : {})
        }}
        title="Con detalle"
      >
        Detalle
      </button>

      <button
        type="button"
        onClick={() => onChange('na')}
        style={{
          ...styles.toggleButton,
          ...(value === 'na' ? styles.toggleNAActive : {})
        }}
        title="No aplica"
      >
        N/A
      </button>
    </div>
  </div>
);
  const renderTextarea = (label, value, onChange, placeholder = '') => (
  <div style={styles.fieldFull}>
    <label style={styles.label}>{label}</label>
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.textarea}
      rows={4}
    />
  </div>
);

  const renderCheckboxGrid = (section, fields) => (
    <div style={styles.checkboxGrid}>
      {fields.map(({ key, label }) => (
        <label key={key} style={styles.checkboxItem}>
          <input
            type="checkbox"
            checked={!!form?.[section]?.[key]}
            onChange={() => handleCheckboxField(section, key)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );

  const renderDamageZone = (zoneKey, label) => {
  const selected = form.carroceria?.zonas?.[zoneKey] || [];

  return (
    <div style={styles.damageZoneCard}>
      <div style={styles.damageZoneHeader}>
        <h4 style={styles.damageZoneTitle}>{label}</h4>
      </div>

      <div style={styles.damageChips}>
        {carroceriaDamageOptions.map((option) => {
          const active = selected.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleCarroceriaDamage(zoneKey, option.value)}
              style={{
                ...styles.damageChip,
                ...(active ? styles.damageChipActive : {})
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const renderNeumaticoCard = (positionKey, label) => {
  const current = form.carroceria?.neumaticos?.[positionKey] || {
    neumatico: '',
    rin: ''
  };

  return (
    <div style={styles.tireCard}>
      <h4 style={styles.tireCardTitle}>{label}</h4>

      <div style={styles.field}>
        <label style={styles.label}>Neumático</label>
        <select
          value={current.neumatico || ''}
          onChange={(e) => updateNeumaticoField(positionKey, 'neumatico', e.target.value)}
          style={styles.input}
        >
          <option value="">Selecciona</option>
          {neumaticoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Rin</label>
        <select
          value={current.rin || ''}
          onChange={(e) => updateNeumaticoField(positionKey, 'rin', e.target.value)}
          style={styles.input}
        >
          <option value="">Selecciona</option>
          {rinOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

  const showNotification = (type, message) => {
  setNotification({ type, message });
};

  const isBusy = saving || uploading;

  return (
    <div style={styles.workspace}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Expediente de avalúo</h2>
          <p style={styles.sidebarText}>
            {mode === 'create' ? 'Nuevo avalúo' : 'Editar avalúo'}
          </p>
        </div>

        <div style={styles.sectionNav}>
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              style={{
                ...styles.sectionButton,
                ...(activeSection === section.key ? styles.sectionButtonActive : {})
              }}
              onClick={() => scrollToSection(section.key)}
            >
              <span>{section.label}</span>
              {renderSectionStatus(section.key)}
            </button>
          ))}
        </div>
      </aside>

      <div style={styles.main}>
        <div style={styles.heroCard}>
          <div>
            <h1 style={styles.formTitle}>{form.folio || 'Avalúo sin folio'}</h1>
            <p style={styles.formMeta}>
              Cliente: {form.clienteNombre || '-'} · Estatus actual: {form.estatus || 'borrador'}
            </p>
          </div>

          <div style={styles.topbarActions}>
            <button style={styles.secondaryButton} onClick={onBack} disabled={isBusy}>
              Volver
            </button>
            <button
  style={styles.secondaryButton}
  onClick={handleSaveDraft}
  disabled={saving || uploading}
>
  {saving ? 'Guardando...' : 'Guardar borrador'}
</button>



<button
  type="button"
  style={styles.primaryButton}
  onClick={handleSaveAppraisal}
  disabled={isBusy}
>
  {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar avalúo'}
</button>
          </div>
        </div>

        {notification && (
  <div
    style={{
      ...styles.notificationBox,
      ...(notification.type === 'success'
        ? styles.notificationSuccess
        : notification.type === 'warning'
        ? styles.notificationWarning
        : styles.notificationError)
    }}
  >
    {notification.message}
  </div>
)}

        {!validation.requiredHeader && (
          <div style={styles.infoBox}>
            Completa primero el encabezado. Para guardar o subir fotos, el encabezado debe quedar lleno.
          </div>
        )}

        <div style={styles.flowContainer}>
          <AppraisalSection
            sectionKey="encabezado"
            title="Encabezado"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  <div style={styles.field}>
    <label style={styles.label}>Folio</label>
    <input
      type="text"
      value={form.folio || ''}
      readOnly
      style={styles.inputReadOnly}
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Fecha de avalúo</label>
    <input
      type="date"
      value={toDateInputValue(form.fechaAvaluo)}
      readOnly
      style={styles.inputReadOnly}
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Nombre del cliente</label>
    <input
      type="text"
      value={form.clienteNombre || ''}
      onChange={handleClienteChange}
      onBlur={handleClienteBlur}
      placeholder="Nombre del cliente"
      style={{
        ...styles.input,
        ...(!hasValue(form.clienteNombre) ? styles.inputRequired : {})
      }}
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Teléfono</label>
    <input
      type="text"
      inputMode="numeric"
      value={formatPhoneDisplay(form.clienteTelefono)}
      onChange={handleTelefonoChange}
      placeholder="222 123 4567"
      style={{
        ...styles.input,
        ...(formatPhoneDigits(form.clienteTelefono).length > 0 &&
        formatPhoneDigits(form.clienteTelefono).length !== 10
          ? styles.inputError
          : !hasValue(form.clienteTelefono)
          ? styles.inputRequired
          : {})
      }}
    />
    {formatPhoneDigits(form.clienteTelefono).length > 0 &&
      formatPhoneDigits(form.clienteTelefono).length !== 10 && (
        <span style={styles.helperError}>El teléfono debe tener 10 dígitos.</span>
      )}
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Vehículo de interés</label>
    <input
      type="text"
      value={form.vehiculoInteres || ''}
      onChange={handleVehiculoInteresChange}
      placeholder="Ej. Mazda CX-5 2020"
      style={{
        ...styles.input,
        ...(!hasValue(form.vehiculoInteres) ? styles.inputRequired : {})
      }}
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Asesor de ventas</label>
    <input
      type="text"
      value={form.asesorVentas || ''}
      readOnly
      style={styles.inputReadOnly}
    />
  </div>
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="generales"
            title="Generales del vehículo"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  {renderField(
    'Marca',
    form.generales.marca,
    (e) => handleGeneralTitle('marca', e.target.value),
    'text',
    'Ej. Mazda'
  )}

  {renderField(
    'Submarca',
    form.generales.submarca,
    (e) => handleGeneralTitle('submarca', e.target.value),
    'text',
    'Ej. CX-5'
  )}

  {renderField(
    'Versión',
    form.generales.version,
    (e) => handleGeneralTextChange('version', e.target.value),
    'text',
    'Ej. i Grand Touring'
  )}

  {renderField(
    'Año modelo',
    form.generales.anio,
    (e) => handleAnioChange(e.target.value),
    'text',
    'Ej. 2020'
  )}

  <div style={styles.field}>
    <label style={styles.label}>Transmisión</label>
    <select
      value={form.generales.transmision || ''}
      onChange={(e) => updateSectionField('generales', 'transmision', e.target.value)}
      style={styles.input}
    >
      <option value="">Selecciona</option>
      <option value="Automática">Automática</option>
      <option value="Manual">Manual</option>
      <option value="CVT">CVT</option>
      <option value="No especificado">No especificado</option>
    </select>
  </div>

  {renderField(
    'Color',
    form.generales.color,
    (e) => handleGeneralTitle('color', e.target.value),
    'text',
    'Ej. Blanco perla'
  )}

  {renderField(
    'Kilometraje',
    form.generales.kilometraje,
    (e) => handleKilometrajeChange(e.target.value),
    'text',
    'Ej. 87000'
  )}

  <div style={styles.field}>
    <label style={styles.label}>Número de dueños</label>
    <select
      value={form.generales.numeroDuenos || ''}
      onChange={(e) => updateSectionField('generales', 'numeroDuenos', e.target.value)}
      style={styles.input}
    >
      <option value="">Selecciona</option>
      <option value="Único dueño">Único dueño</option>
      <option value="2 dueños">2 dueños</option>
      <option value="3 dueños">3 dueños</option>
      <option value="4+ dueños">4+ dueños</option>
      <option value="No sabe">No sabe</option>
    </select>
  </div>

  {renderField(
    'Número de serie',
    form.generales.numeroSerie,
    (e) => handleGeneralUppercase('numeroSerie', e.target.value),
    'text',
    'VIN'
  )}

  {renderField(
    'Placas',
    form.generales.placas,
    (e) => handleGeneralUppercase('placas', e.target.value),
    'text',
    'Ej. ABC1234'
  )}

  {renderTextarea(
  'Comentarios',
  form.generales.comentarios,
  (e) => handleGeneralTextChange('comentarios', e.target.value),
  'Ej. Vehículo con desgaste normal de uso y detalle ligero en fascia delantera'
)}
</div>
            
          </AppraisalSection>

          <AppraisalSection
            sectionKey="documentacion"
            title="Documentación"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  {renderYesNoField('Factura', form.documentacion.factura, (val) =>
    updateSectionField('documentacion', 'factura', val)
  )}

  {renderYesNoField('Carta origen', form.documentacion.cartaOrigen, (val) =>
    updateSectionField('documentacion', 'cartaOrigen', val)
  )}

  {renderYesNoField('Tenencias', form.documentacion.tenencias, (val) =>
    updateSectionField('documentacion', 'tenencias', val)
  )}

  {renderYesNoField('Último servicio', form.documentacion.ultimoServicio, (val) =>
    updateSectionField('documentacion', 'ultimoServicio', val)
  )}

  {renderYesNoField('Verificación', form.documentacion.verificacion, (val) =>
    updateSectionField('documentacion', 'verificacion', val)
  )}

  {renderYesNoField('Manuales', form.documentacion.manuales, (val) =>
    updateSectionField('documentacion', 'manuales', val)
  )}

  {renderYesNoField('Garantía', form.documentacion.garantia, (val) =>
    updateSectionField('documentacion', 'garantia', val)
  )}

  {renderYesNoField('Engomado', form.documentacion.engomado, (val) =>
    updateSectionField('documentacion', 'engomado', val)
  )}

  {renderYesNoField('Tarjeta de circulación', form.documentacion.tarjetaCirculacion, (val) =>
    updateSectionField('documentacion', 'tarjetaCirculacion', val)
  )}

  {renderYesNoField('Póliza de seguro', form.documentacion.polizaSeguro, (val) =>
    updateSectionField('documentacion', 'polizaSeguro', val)
  )}

  {renderTextarea(
    'Comentarios',
    form.documentacion.comentarios,
    (e) => updateSectionField('documentacion', 'comentarios', e.target.value),
    'Ej. Factura original, falta endoso'
  )}
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="interior"
            title="Aspecto físico interior"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  {renderConditionField('Vestiduras', form.interior.vestiduras, (val) =>
    updateSectionField('interior', 'vestiduras', val)
  )}

  {renderConditionField('Cielo', form.interior.cielo, (val) =>
    updateSectionField('interior', 'cielo', val)
  )}

  {renderConditionField('Consola central', form.interior.consolaCentral, (val) =>
    updateSectionField('interior', 'consolaCentral', val)
  )}

  {renderConditionField('Alfombras', form.interior.alfombras, (val) =>
    updateSectionField('interior', 'alfombras', val)
  )}

  {renderConditionField('Tablero', form.interior.tablero, (val) =>
    updateSectionField('interior', 'tablero', val)
  )}

  {renderConditionField('Encendedor / toma corriente', form.interior.encendedor, (val) =>
    updateSectionField('interior', 'encendedor', val)
  )}

  {renderConditionField('Puertas / vestiduras laterales', form.interior.puertasLaterales, (val) =>
    updateSectionField('interior', 'puertasLaterales', val)
  )}

  {renderConditionField('Volante', form.interior.volante, (val) =>
    updateSectionField('interior', 'volante', val)
  )}

  {renderTextarea(
    'Comentarios',
    form.interior.comentarios,
    (e) => updateSectionField('interior', 'comentarios', e.target.value),
    'Ej. Vestiduras con desgaste ligero en asiento del conductor y detalle menor en tablero'
  )}
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="carroceria"
            title="Carrocería y neumáticos"
            subtitle="Deja aquí las observaciones generales del estado exterior y neumáticos."
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.carroceriaWrapper}>
  <div style={styles.subsectionBlock}>
    <h4 style={styles.subsectionTitle}>Carrocería por zonas</h4>
    <p style={styles.helperText}>
      Selecciona uno o varios hallazgos por cada zona del vehículo.
    </p>

    <div style={styles.damageZoneGrid}>
      {carroceriaZones.map((zone) => renderDamageZone(zone.key, zone.label))}
    </div>
  </div>

  <div style={styles.subsectionBlock}>
    <h4 style={styles.subsectionTitle}>Neumáticos y rines</h4>
    <p style={styles.helperText}>
      Para guardar el avalúo completo debes evaluar las 4 posiciones.
    </p>

    <div style={styles.tireGrid}>
      {neumaticoPositions.map((position) =>
        renderNeumaticoCard(position.key, position.label)
      )}
    </div>
  </div>

  {renderTextarea(
    'Comentarios',
    form.carroceria.observaciones,
    (e) => updateSectionField('carroceria', 'observaciones', e.target.value),
    'Ej. Costado izquierdo con abolladura ligera y llanta delantera derecha desgastada'
  )}
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="sistemaElectrico"
            title="Sistema eléctrico"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  {renderYesNoNAField('Espejos eléctricos', form.sistemaElectrico.espejosElectricos, (val) => updateSectionField('sistemaElectrico', 'espejosElectricos', val))}
  {renderYesNoNAField('Bolsas de aire', form.sistemaElectrico.bolsasAire, (val) => updateSectionField('sistemaElectrico', 'bolsasAire', val))}
  {renderYesNoNAField('Aire acondicionado', form.sistemaElectrico.aireAcondicionado, (val) => updateSectionField('sistemaElectrico', 'aireAcondicionado', val))}
  {renderYesNoNAField('Control de crucero', form.sistemaElectrico.controlCrucero, (val) => updateSectionField('sistemaElectrico', 'controlCrucero', val))}
  {renderYesNoNAField('Chisguetero', form.sistemaElectrico.chisguetero, (val) => updateSectionField('sistemaElectrico', 'chisguetero', val))}
  {renderYesNoNAField('Luz de mapa', form.sistemaElectrico.luzMapa, (val) => updateSectionField('sistemaElectrico', 'luzMapa', val))}

  {renderYesNoNAField('Controles de volante', form.sistemaElectrico.controlesVolante, (val) => updateSectionField('sistemaElectrico', 'controlesVolante', val))}
  {renderYesNoNAField('Check engine', form.sistemaElectrico.checkEngine, (val) => updateSectionField('sistemaElectrico', 'checkEngine', val))}
  {renderYesNoNAField('Asientos eléctricos', form.sistemaElectrico.asientosElectricos, (val) => updateSectionField('sistemaElectrico', 'asientosElectricos', val))}
  {renderYesNoNAField('Encendedor', form.sistemaElectrico.encendedor, (val) => updateSectionField('sistemaElectrico', 'encendedor', val))}
  {renderYesNoNAField('Claxon', form.sistemaElectrico.claxon, (val) => updateSectionField('sistemaElectrico', 'claxon', val))}

  {renderYesNoNAField('Luces internas', form.sistemaElectrico.lucesInternas, (val) => updateSectionField('sistemaElectrico', 'lucesInternas', val))}
  {renderYesNoNAField('Seguros eléctricos', form.sistemaElectrico.segurosElectricos, (val) => updateSectionField('sistemaElectrico', 'segurosElectricos', val))}
  {renderYesNoNAField('Cristales eléctricos', form.sistemaElectrico.cristalesElectricos, (val) => updateSectionField('sistemaElectrico', 'cristalesElectricos', val))}
  {renderYesNoNAField('Apertura cajuela', form.sistemaElectrico.aperturaCajuela, (val) => updateSectionField('sistemaElectrico', 'aperturaCajuela', val))}
  {renderYesNoNAField('Pantalla', form.sistemaElectrico.pantalla, (val) => updateSectionField('sistemaElectrico', 'pantalla', val))}
  {renderYesNoNAField('Faros de niebla', form.sistemaElectrico.farosNiebla, (val) => updateSectionField('sistemaElectrico', 'farosNiebla', val))}

  {renderYesNoNAField('Luces externas', form.sistemaElectrico.lucesExternas, (val) => updateSectionField('sistemaElectrico', 'lucesExternas', val))}
  {renderYesNoNAField('Limpiadores', form.sistemaElectrico.limpiadores, (val) => updateSectionField('sistemaElectrico', 'limpiadores', val))}
  {renderYesNoNAField('Estéreo / USB', form.sistemaElectrico.estereoUsb, (val) => updateSectionField('sistemaElectrico', 'estereoUsb', val))}
  {renderYesNoNAField('Quemacocos', form.sistemaElectrico.quemacocos, (val) => updateSectionField('sistemaElectrico', 'quemacocos', val))}
  {renderYesNoNAField('Testigos', form.sistemaElectrico.testigos, (val) => updateSectionField('sistemaElectrico', 'testigos', val))}
  {renderYesNoNAField('Direccionales', form.sistemaElectrico.direccionales, (val) => updateSectionField('sistemaElectrico', 'direccionales', val))}

  {renderTextarea(
    'Comentarios',
    form.sistemaElectrico.comentarios,
    (e) => updateSectionField('sistemaElectrico', 'comentarios', e.target.value),
    'Ej. Aire acondicionado no enfría y check engine activo'
  )}
</div>
            
          </AppraisalSection>

          <AppraisalSection
            sectionKey="fugasMotor"
            title="Fugas y motor"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  {renderTechnicalStatusField('Motor', form.fugasMotor.motor, (val) =>
    updateSectionField('fugasMotor', 'motor', val)
  )}

  {renderTechnicalStatusField('Transmisión', form.fugasMotor.transmision, (val) =>
    updateSectionField('fugasMotor', 'transmision', val)
  )}

  {renderTechnicalStatusField('Sistema de frenos', form.fugasMotor.sistemaFrenos, (val) =>
    updateSectionField('fugasMotor', 'sistemaFrenos', val)
  )}

  {renderTechnicalStatusField('Dirección hidráulica', form.fugasMotor.direccionHidraulica, (val) =>
    updateSectionField('fugasMotor', 'direccionHidraulica', val)
  )}

  {renderTechnicalStatusField('Amortiguadores', form.fugasMotor.amortiguadores, (val) =>
    updateSectionField('fugasMotor', 'amortiguadores', val)
  )}

  {renderTechnicalStatusField('Anticongelante', form.fugasMotor.anticongelante, (val) =>
    updateSectionField('fugasMotor', 'anticongelante', val)
  )}

  {renderTechnicalStatusField('Aire acondicionado', form.fugasMotor.aireAcondicionado, (val) =>
    updateSectionField('fugasMotor', 'aireAcondicionado', val)
  )}

  {renderTechnicalStatusField('Flechas', form.fugasMotor.flechas, (val) =>
    updateSectionField('fugasMotor', 'flechas', val)
  )}

  {renderTechnicalStatusField('Soportes de motor', form.fugasMotor.soportesMotor, (val) =>
    updateSectionField('fugasMotor', 'soportesMotor', val)
  )}

  {renderTechnicalStatusField('Soportes de caja', form.fugasMotor.soportesCaja, (val) =>
    updateSectionField('fugasMotor', 'soportesCaja', val)
  )}

  {renderTextarea(
    'Comentarios',
    form.fugasMotor.comentarios,
    (e) => updateSectionField('fugasMotor', 'comentarios', e.target.value),
    'Ej. Ligera fuga en dirección hidráulica y soportes de motor con desgaste visible'
  )}
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="valuacion"
            title="Valuación"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
  <div style={styles.field}>
    <label style={styles.label}>Toma libro</label>
    <input
      type="text"
      value={formatMoneyDisplay(form.valuacion.tomaLibro)}
      onChange={(e) => handleValuacionNumberChange('tomaLibro', e.target.value)}
      placeholder="Ej. 180000"
      style={styles.input}
      inputMode="numeric"
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Venta libro</label>
    <input
      type="text"
      value={formatMoneyDisplay(form.valuacion.ventaLibro)}
      onChange={(e) => handleValuacionNumberChange('ventaLibro', e.target.value)}
      placeholder="Ej. 220000"
      style={styles.input}
      inputMode="numeric"
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Media</label>
    <input
      type="text"
      value={formatMoneyDisplay(form.valuacion.media)}
      readOnly
      placeholder="Se calcula automáticamente"
      style={styles.inputReadOnly}
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Reparaciones</label>
    <input
      type="text"
      value={formatMoneyDisplay(form.valuacion.reparaciones)}
      onChange={(e) => handleValuacionNumberChange('reparaciones', e.target.value)}
      placeholder="Ej. 8500"
      style={styles.input}
      inputMode="numeric"
    />
  </div>

  <div style={styles.field}>
    <label style={styles.label}>Toma autorizada</label>
    <input
      type="text"
      value={formatMoneyDisplay(form.valuacion.tomaAutorizada)}
      onChange={(e) => handleValuacionNumberChange('tomaAutorizada', e.target.value)}
      placeholder="Ej. 178000"
      style={styles.input}
      inputMode="numeric"
    />
  </div>

  {renderTextarea(
    'Comentarios',
    form.valuacion.comentarios,
    (e) => updateSectionField('valuacion', 'comentarios', e.target.value),
    'Ej. Se considera ajuste por detalle estético y costo estimado de reacondicionamiento'
  )}
</div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="fotosGenerales"
            title="Fotos generales"
            subtitle="Captura o reemplaza cada una de las tomas requeridas."
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            {!validation.requiredHeader && (
              <div style={styles.warningBox}>
                Para capturar fotos primero completa el encabezado y guarda el borrador.
              </div>
            )}

            <div style={styles.generalPhotoGrid}>
              {generalPhotoSlots.map((slot) => {
                const photo = form.fotosGeneralesMap?.[slot.key];

                return (
                  <div key={slot.key} style={styles.generalPhotoCard}>
                    <input
                      ref={(el) => {
                        generalInputRefs.current[slot.key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleGeneralPhotoChange(slot.key, e)}
                    />

                    <div
                      style={styles.generalPhotoPreview}
                      onClick={() => handleGeneralPhotoClick(slot.key)}
                    >
                      {photo?.preview ? (
                        <img src={photo.preview} alt={slot.label} style={styles.previewImage} />
                      ) : (
                        <div style={styles.silhouetteBox}>
                          <div style={styles.silhouetteIcon}>📷</div>
                          <div style={styles.silhouetteText}>Tomar foto</div>
                        </div>
                      )}
                    </div>

                    <div style={styles.generalPhotoFooter}>
                      <strong>{slot.label}</strong>
                      <div style={styles.slotActions}>
                        <button
                          type="button"
                          style={styles.smallButton}
                          onClick={() => handleGeneralPhotoClick(slot.key)}
                          disabled={isBusy}
                        >
                          {photo ? 'Reemplazar' : 'Capturar'}
                        </button>

                        {photo && (
                          <button
                            type="button"
                            style={styles.smallDangerButton}
                            onClick={() => removeGeneralPhoto(slot.key)}
                            disabled={isBusy}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="fotosDetalle"
            title="Fotos de detalle"
            subtitle="Agrega evidencias adicionales, daños, interiores, motor o cualquier hallazgo relevante."
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <input
              ref={detailInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              style={{ display: 'none' }}
              onChange={handleAddDetailPhotos}
            />

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => {
                if (!ensureHeaderBeforeUpload()) return;
                detailInputRef.current?.click();
              }}
              disabled={isBusy}
            >
              + Agregar fotos de detalle
            </button>

            <div style={styles.detailPhotoGrid}>
              {form.fotosDetalle.length === 0 ? (
                <div style={styles.emptyPhotoBox}>No hay fotos de detalle aún.</div>
              ) : (
                form.fotosDetalle.map((photo, index) => (
                  <div key={`${photo.name}-${index}`} style={styles.detailPhotoCard}>
                    <div style={styles.detailPhotoPreview}>
                      {photo.preview ? (
                        <img src={photo.preview} alt={photo.name} style={styles.previewImage} />
                      ) : (
                        <div style={styles.emptyPhotoBox}>Sin vista previa</div>
                      )}
                    </div>

                    <div style={styles.detailPhotoInfo}>
                      <span style={styles.detailPhotoName}>{photo.name}</span>
                      <button
                        type="button"
                        style={styles.smallDangerButton}
                        onClick={() => removeDetailPhoto(index)}
                        disabled={isBusy}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="revisionFinal"
            title="Revisión final"
            subtitle="Antes de guardar el avalúo, valida que todo lo esencial esté listo."
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.validationGrid}>
              <div style={styles.validationItem}>
                <strong>Encabezado</strong>
                <span style={{ ...styles.statusPill, ...(validation.requiredHeader ? styles.statusOk : styles.statusPending) }}>
                  {validation.requiredHeader ? 'Listo' : 'Incompleto'}
                </span>
              </div>

              <div style={styles.validationItem}>
                <strong>Generales del vehículo</strong>
                <span style={{ ...styles.statusPill, ...(validation.requiredGenerales ? styles.statusOk : styles.statusPending) }}>
                  {validation.requiredGenerales ? 'Listo' : 'Incompleto'}
                </span>
              </div>

              <div style={styles.validationItem}>
                <strong>Valuación</strong>
                <span style={{ ...styles.statusPill, ...(validation.requiredValuacion ? styles.statusOk : styles.statusPending) }}>
                  {validation.requiredValuacion ? 'Listo' : 'Incompleto'}
                </span>
              </div>

              <div style={styles.validationItem}>
                <strong>Fotos requeridas</strong>
                <span style={{ ...styles.statusPill, ...(validation.requiredPhotos ? styles.statusOk : styles.statusPending) }}>
                  {validation.requiredPhotos ? 'Listo' : 'Incompleto'}
                </span>
              </div>
            </div>
          </AppraisalSection>
        </div>

        <div style={styles.bottomBar}>
          <div style={styles.bottomBarText}>
            {validation.canComplete
              ? 'El avalúo ya cumple con lo requerido para guardarse como completo.'
              : 'Todavía faltan campos o evidencias para guardarlo como avalúo completo.'}
          </div>

          <div style={styles.topbarActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleSaveDraft}
              disabled={isBusy}
            >
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={handleSaveAppraisal}
              disabled={isBusy}
            >
              {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar avalúo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  workspace: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '12px',
    alignItems: 'start'
  },
  sidebar: {
    background: '#fff',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '12px',
    alignSelf: 'start'
  },
  sidebarHeader: {
    marginBottom: '10px'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111827',
    fontWeight: 800
  },
  sidebarText: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px',
    lineHeight: 1.35
  },
  sectionNav: {
    display: 'grid',
    gap: '6px'
  },
  sectionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    padding: '7px 9px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'left'
  },
  sectionButtonActive: {
    background: '#eff6ff',
    border: '1px solid #93c5fd',
    color: '#1d4ed8'
  },
  navStatus: {
    fontSize: '10px',
    fontWeight: 800,
    padding: '3px 7px',
    borderRadius: '999px',
    whiteSpace: 'nowrap'
  },
  navStatusOk: {
    background: '#dcfce7',
    color: '#166534'
  },
  navStatusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },
  main: {
    display: 'grid',
    gap: '10px'
  },
  heroCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '10px 12px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '8px'
  },
  formTitle: {
    margin: 0,
    fontSize: '17px',
    color: '#111827',
    lineHeight: 1.1,
    fontWeight: 800
  },
  formMeta: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px'
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  sectionCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.04)',
    border: '1px solid transparent'
  },
  sectionCardActive: {
    border: '1px solid #dbe3ee'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 800,
    color: '#111827'
  },
  helperText: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px',
    lineHeight: 1.35
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  },
  field: {
    display: 'grid',
    gap: '4px'
  },
  fieldFull: {
    display: 'grid',
    gap: '4px',
    marginTop: '10px'
  },
  label: {
    fontWeight: 700,
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#fff',
    color: '#111827',
    minHeight: '34px'
  },
  inputDisabled: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed',
    minHeight: '34px'
  },
  inputReadOnly: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f8fafc',
    color: '#475569',
    minHeight: '34px'
  },
  inputRequired: {
    border: '1px solid #f59e0b',
    background: '#fffbeb'
  },
  inputError: {
    border: '1px solid #ef4444',
    background: '#fef2f2'
  },
  helperError: {
    display: 'block',
    marginTop: '4px',
    fontSize: '11px',
    color: '#b91c1c',
    fontWeight: 600
  },
  textarea: {
    width: '100%',
    padding: '9px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'vertical',
    fontSize: '13px',
    minHeight: '78px',
    color: '#111827',
    background: '#fff'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px'
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fafafa',
    fontSize: '12px'
  },
  radioGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600
  },
  toggleGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  toggleButton: {
    minWidth: '30px',
    height: '28px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  toggleYesActive: {
    background: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#166534'
  },
  toggleNoActive: {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#7f1d1d'
  },
  toggleNAActive: {
    background: '#e5e7eb',
    border: '1px solid #9ca3af',
    color: '#374151'
  },
  conditionGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  conditionButton: {
    minWidth: '72px',
    padding: '6px 8px',
    borderRadius: '7px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    color: '#334155',
    transition: 'all 0.2s ease'
  },
  conditionExcellent: {
    background: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#166534'
  },
  conditionGood: {
    background: '#dbeafe',
    border: '1px solid #3b82f6',
    color: '#1d4ed8'
  },
  conditionRegular: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e'
  },
  conditionBad: {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b'
  },
  primaryButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  disabledButton: {
    background: '#e5e7eb',
    color: '#9ca3af',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'not-allowed',
    fontWeight: 700,
    fontSize: '12px'
  },
  infoBox: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '12px',
    border: '1px solid #bfdbfe'
  },
  warningBox: {
    background: '#fff7ed',
    color: '#9a3412',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '12px',
    border: '1px solid #fed7aa',
    marginBottom: '10px'
  },
  notificationBox: {
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '12px',
    border: '1px solid transparent',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)'
  },
  notificationSuccess: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  notificationWarning: {
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa'
  },
  notificationError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  generalPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  },
  generalPhotoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff'
  },
  generalPhotoPreview: {
    height: '150px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  silhouetteBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280'
  },
  silhouetteIcon: {
    fontSize: '22px'
  },
  silhouetteText: {
    fontSize: '12px',
    fontWeight: 700
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  generalPhotoFooter: {
    padding: '10px',
    display: 'grid',
    gap: '8px'
  },
  slotActions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  smallButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px'
  },
  smallDangerButton: {
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px'
  },
  detailPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  detailPhotoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff'
  },
  detailPhotoPreview: {
    height: '150px',
    background: '#f8fafc'
  },
  detailPhotoInfo: {
    padding: '10px',
    display: 'grid',
    gap: '8px'
  },
  detailPhotoName: {
    fontSize: '12px',
    color: '#111827',
    wordBreak: 'break-word'
  },
  emptyPhotoBox: {
    border: '1px dashed #d1d5db',
    borderRadius: '12px',
    padding: '16px',
    color: '#6b7280',
    textAlign: 'center',
    fontSize: '12px'
  },
  carroceriaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  subsectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  subsectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a'
  },
  damageZoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  damageZoneCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px',
    background: '#f8fafc'
  },
  damageZoneHeader: {
    marginBottom: '8px'
  },
  damageZoneTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f172a'
  },
  damageChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  damageChip: {
    border: '1px solid #d1d5db',
    borderRadius: '999px',
    padding: '6px 10px',
    background: '#ffffff',
    color: '#334155',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  damageChipActive: {
    background: '#dbeafe',
    border: '1px solid #3b82f6',
    color: '#1d4ed8'
  },
  tireGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  tireCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tireCardTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f172a'
  },
  validationGrid: {
    display: 'grid',
    gap: '8px'
  },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    background: '#fafafa'
  },
  statusPill: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 800
  },
  statusOk: {
    background: '#dcfce7',
    color: '#166534'
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },
  bottomBar: {
    position: 'sticky',
    bottom: '0',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #e5e7eb',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  bottomBarText: {
    color: '#4b5563',
    fontWeight: 600,
    fontSize: '12px'
  }
};