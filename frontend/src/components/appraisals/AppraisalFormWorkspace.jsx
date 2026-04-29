import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadAppraisalPhoto } from '../../services/appraisalPhotoService';
import { styles } from './AppraisalFormWorkspace.styles';
import {
  AppraisalFormHeaderSection,
  AppraisalFormGeneralesSection,
  AppraisalFormDocumentacionSection,
  AppraisalFormInteriorSection,
  AppraisalFormCarroceriaSection,
  AppraisalFormSistemaElectricoSection,
  AppraisalFormFugasMotorSection,
  AppraisalFormValuacionSection,
  AppraisalFormFotosGeneralesSection,
  AppraisalFormFotosDetalleSection,
  AppraisalFormRevisionFinalSection
} from './sections';


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
  { key: 'fotosGenerales', label: 'Fotos generales' },
  { key: 'fotosDetalle', label: 'Fotos de detalle' },
  { key: 'carroceria', label: 'Carrocería y neumáticos' },
  { key: 'sistemaElectrico', label: 'Sistema eléctrico' },
  { key: 'fugasMotor', label: 'Fugas y motor' },
  { key: 'valuacion', label: 'Valuación' },
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

const getValidation = (form) => {
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
  registerSectionRef,
  renderSectionStatus,
  children
}) {
  return (
    <section
      ref={(el) => {
        registerSectionRef(sectionKey, el);
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
  usuario,
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
  const [popupMessage, setPopupMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('encabezado');
  const currentRole = String(usuario?.rol || '').toLowerCase();
  const isManagerRole = ['administrador', 'gerente_avaluos', 'gerente'].includes(currentRole);
  const isTechnicalRole = ['tecnico_servicio', 'tecnico'].includes(currentRole);

  const canEditSection = (sectionKey) => {
    if (isManagerRole) return true;
    if (isTechnicalRole) {
      return ['fotosDetalle', 'carroceria', 'sistemaElectrico', 'fugasMotor'].includes(sectionKey);
    }
    return !['carroceria', 'sistemaElectrico', 'fugasMotor'].includes(sectionKey);
  };

  const getRoleFriendlyName = () => {
    if (isManagerRole) return 'Gerencia';
    if (isTechnicalRole) return 'Técnico de servicio';
    return 'Asesor';
  };

  const sectionRefs = useRef({});
const generalInputRefs = useRef({});
const detailInputRef = useRef(null);

const registerSectionRef = (key, el) => {
  sectionRefs.current = {
    ...sectionRefs.current,
    [key]: el
  };
};

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
  return getValidation(form);
}, [form]);

  const scrollToSection = (key) => {
    if (!canEditSection(key) && ['carroceria', 'sistemaElectrico', 'fugasMotor', 'valuacion'].includes(key)) {
      setPopupMessage({
        title: 'Sección restringida por rol',
        message: `${getRoleFriendlyName()} no puede editar esta sección. Solo el perfil autorizado puede capturarla.`
      });
    }
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
  if (!isManagerRole) {
    setPopupMessage({
      title: 'Acción restringida',
      message: 'Solo gerencia puede validar el avalúo completo y confirmar precio.'
    });
    return;
  }
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
    setPopupMessage({
      title: 'Faltan datos por completar',
      message: `No se puede guardar el avalúo. Falta completar: ${warnings.join(' | ')}`
    });
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

  const renderField = (label, value, onChange, type = 'text', placeholder = '', disabled = false) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.input}
      disabled={disabled}
    />
  </div>
);

const renderYesNoField = (label, value, onChange, disabled = false) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('si')}
        disabled={disabled}
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
        disabled={disabled}
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

const renderYesNoNAField = (label, value, onChange, disabled = false) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('si')}
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
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

const renderConditionField = (label, value, onChange, disabled = false) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.conditionGroup}>
      <button
        type="button"
        onClick={() => onChange('excelente')}
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
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

const renderTechnicalStatusField = (label, value, onChange, disabled = false) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <div style={styles.toggleGroup}>
      <button
        type="button"
        onClick={() => onChange('ok')}
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
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
  const renderTextarea = (label, value, onChange, placeholder = '', disabled = false) => (
  <div style={styles.fieldFull}>
    <label style={styles.label}>{label}</label>
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.textarea}
      rows={4}
      disabled={disabled}
    />
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
      {popupMessage && (
        <div style={styles.popupOverlay} onClick={() => setPopupMessage(null)}>
          <div style={styles.popupCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.popupTitle}>{popupMessage.title}</h3>
            <p style={styles.popupText}>{popupMessage.message}</p>
            <button type="button" style={styles.primaryButton} onClick={() => setPopupMessage(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
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
          <AppraisalFormHeaderSection
  
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  toDateInputValue={toDateInputValue}
  handleClienteChange={handleClienteChange}
  handleClienteBlur={handleClienteBlur}
  hasValue={hasValue}
  formatPhoneDisplay={formatPhoneDisplay}
  formatPhoneDigits={formatPhoneDigits}
  handleTelefonoChange={handleTelefonoChange}
  handleVehiculoInteresChange={handleVehiculoInteresChange}
/>

          <AppraisalFormGeneralesSection
  isReadOnly={!canEditSection('generales')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  renderField={renderField}
  renderTextarea={renderTextarea}
  handleGeneralTitle={handleGeneralTitle}
  handleGeneralTextChange={handleGeneralTextChange}
  handleAnioChange={handleAnioChange}
  updateSectionField={updateSectionField}
  handleKilometrajeChange={handleKilometrajeChange}
  handleGeneralUppercase={handleGeneralUppercase}
/>

          <AppraisalFormDocumentacionSection
  isReadOnly={!canEditSection('documentacion')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  renderYesNoField={renderYesNoField}
  renderTextarea={renderTextarea}
  updateSectionField={updateSectionField}
/>

          <AppraisalFormInteriorSection
  isReadOnly={!canEditSection('interior')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  renderConditionField={renderConditionField}
  renderTextarea={renderTextarea}
  updateSectionField={updateSectionField}
/>

          <AppraisalFormFotosGeneralesSection
  isReadOnly={!canEditSection('fotosGenerales')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  validation={validation}
  generalPhotoSlots={generalPhotoSlots}
  form={form}
  generalInputRefs={generalInputRefs}
  handleGeneralPhotoChange={handleGeneralPhotoChange}
  handleGeneralPhotoClick={handleGeneralPhotoClick}
  isBusy={isBusy}
  removeGeneralPhoto={removeGeneralPhoto}
/>

<AppraisalFormFotosDetalleSection
  isReadOnly={!canEditSection('fotosDetalle')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  detailInputRef={detailInputRef}
  handleAddDetailPhotos={handleAddDetailPhotos}
  ensureHeaderBeforeUpload={ensureHeaderBeforeUpload}
  isBusy={isBusy}
  form={form}
  removeDetailPhoto={removeDetailPhoto}
/>

          <AppraisalFormCarroceriaSection
  isReadOnly={!canEditSection('carroceria')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  carroceriaZones={carroceriaZones}
  renderDamageZone={renderDamageZone}
  neumaticoPositions={neumaticoPositions}
  renderNeumaticoCard={renderNeumaticoCard}
  renderTextarea={renderTextarea}
  form={form}
  updateSectionField={updateSectionField}
/>

          <AppraisalFormSistemaElectricoSection
  isReadOnly={!canEditSection('sistemaElectrico')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  renderYesNoNAField={renderYesNoNAField}
  renderTextarea={renderTextarea}
  updateSectionField={updateSectionField}
/>

          <AppraisalFormFugasMotorSection
  isReadOnly={!canEditSection('fugasMotor')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  renderTechnicalStatusField={renderTechnicalStatusField}
  renderTextarea={renderTextarea}
  updateSectionField={updateSectionField}
/>

          <AppraisalFormValuacionSection
  isReadOnly={!canEditSection('valuacion')}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  form={form}
  formatMoneyDisplay={formatMoneyDisplay}
  handleValuacionNumberChange={handleValuacionNumberChange}
  renderTextarea={renderTextarea}
/>

<AppraisalFormRevisionFinalSection
  managerCanValidate={isManagerRole}
  activeSection={activeSection}
  registerSectionRef={registerSectionRef}
  renderSectionStatus={renderSectionStatus}
  styles={styles}
  validation={validation}
/>
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
