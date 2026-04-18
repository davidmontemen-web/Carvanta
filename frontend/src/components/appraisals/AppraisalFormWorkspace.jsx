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
    subMarca: '',
    version: '',
    transmision: '',
    numeroSerie: '',
    anioModelo: '',
    color: '',
    kilometraje: '',
    numeroDuenios: '',
    placas: '',
    complementarios: '',
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
    polizaSeguro: ''
  },
  interior: {
    vestiduras: '',
    cielo: '',
    consola: '',
    alfombras: '',
    tablero: '',
    encendedor: '',
    puertas: '',
    volante: '',
    consolaDos: ''
  },
  carroceria: {
    observaciones: ''
  },
  sistemaElectrico: {
    espejosElectricos: false,
    bolsasAire: false,
    aireAcondicionado: false,
    controlCrucero: false,
    chisguetero: false,
    luzMapa: false,
    funcionesVolante: false,
    checkEngine: false,
    asientosElectricos: false,
    claxon: false,
    lucesInternas: false,
    segurosElectricos: false,
    cristalesElectricos: false,
    aperturaCajuela: false,
    pantalla: false,
    farosNiebla: false,
    lucesExternas: false,
    limpiadores: false,
    estereoUsb: false,
    quemacocos: false,
    testigos: false,
    direccionales: false
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
    tomaAutorizada: ''
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
      ...(source.generales || {})
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
      ...(source.carroceria || {})
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
      ...(source.valuacion || {})
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
  fotosDetalle: form.fotosDetalle
});

const hasValue = (value) => String(value ?? '').trim() !== '';

const getValidation = (form, generalPhotosArray) => {
  const missingHeaderFields = [];
  if (!hasValue(form.clienteNombre)) missingHeaderFields.push('Nombre del cliente');
  if (!hasValue(form.clienteTelefono)) missingHeaderFields.push('Teléfono');
  if (!hasValue(form.vehiculoInteres)) missingHeaderFields.push('Vehículo de interés');
  if (!hasValue(form.fechaAvaluo)) missingHeaderFields.push('Fecha de avalúo');

  const missingGeneralesFields = [];
  if (!hasValue(form.generales?.marca)) missingGeneralesFields.push('Marca');
  if (!hasValue(form.generales?.subMarca)) missingGeneralesFields.push('Sub marca');
  if (!hasValue(form.generales?.anioModelo)) missingGeneralesFields.push('Año modelo');
  if (!hasValue(form.generales?.kilometraje)) missingGeneralesFields.push('Kilometraje');

  const missingValuacionFields = [];
  if (!hasValue(form.valuacion?.tomaLibro)) missingValuacionFields.push('Toma libro');
  if (!hasValue(form.valuacion?.ventaLibro)) missingValuacionFields.push('Venta libro');
  if (!hasValue(form.valuacion?.tomaAutorizada)) missingValuacionFields.push('Toma autorizada');

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
    canComplete:
      missingHeaderFields.length === 0 &&
      missingGeneralesFields.length === 0 &&
      missingValuacionFields.length === 0 &&
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

  const updateSectionField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
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
    'error',
    `Falta completar el encabezado: ${validation.missingHeaderFields.join(', ')}.`
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
      ...validation.missingPhotoRequirements.map((item) => `Fotos: ${item}`)
    ];

    const firstMissingSection = validation.missingGeneralesFields.length
      ? 'generales'
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

  const renderField = (label, value, onChange, type = 'text') => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value || ''} onChange={onChange} style={styles.input} />
    </div>
  );

  const renderTextarea = (label, value, onChange) => (
    <div style={styles.fieldFull}>
      <label style={styles.label}>{label}</label>
      <textarea value={value || ''} onChange={onChange} style={styles.textarea} rows={4} />
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
              {renderField('Folio', form.folio, (e) => updateRootField('folio', e.target.value))}
              {renderField('Asesor de ventas', form.asesorVentas, (e) => updateRootField('asesorVentas', e.target.value))}
              {renderField('Nombre del cliente', form.clienteNombre, (e) => updateRootField('clienteNombre', e.target.value))}
              {renderField('Teléfono', form.clienteTelefono, (e) => updateRootField('clienteTelefono', e.target.value))}
              {renderField('Vehículo de interés', form.vehiculoInteres, (e) => updateRootField('vehiculoInteres', e.target.value))}
              <div style={styles.field}>
  <label style={styles.label}>Fecha de avalúo</label>
  <input
    type="date"
    value={form.fechaAvaluo || getTodayLocalDate()}
    disabled
    style={styles.inputDisabled}
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
            <div style={styles.grid3}>
              {renderField('Marca', form.generales.marca, (e) => updateSectionField('generales', 'marca', e.target.value))}
              {renderField('Sub marca', form.generales.subMarca, (e) => updateSectionField('generales', 'subMarca', e.target.value))}
              {renderField('Versión', form.generales.version, (e) => updateSectionField('generales', 'version', e.target.value))}
              {renderField('Transmisión', form.generales.transmision, (e) => updateSectionField('generales', 'transmision', e.target.value))}
              {renderField('No. de serie', form.generales.numeroSerie, (e) => updateSectionField('generales', 'numeroSerie', e.target.value))}
              {renderField('Año modelo', form.generales.anioModelo, (e) => updateSectionField('generales', 'anioModelo', e.target.value))}
              {renderField('Color', form.generales.color, (e) => updateSectionField('generales', 'color', e.target.value))}
              {renderField('Kilometraje', form.generales.kilometraje, (e) => updateSectionField('generales', 'kilometraje', e.target.value))}
              {renderField('No. dueños', form.generales.numeroDuenios, (e) => updateSectionField('generales', 'numeroDuenios', e.target.value))}
              {renderField('Placas', form.generales.placas, (e) => updateSectionField('generales', 'placas', e.target.value))}
            </div>
            {renderTextarea(
              'Complementarios y comentarios',
              `${form.generales.complementarios || ''}${form.generales.complementarios && form.generales.comentarios ? '\n' : ''}${form.generales.comentarios || ''}`,
              (e) => {
                const value = e.target.value;
                updateSectionField('generales', 'complementarios', value);
                updateSectionField('generales', 'comentarios', '');
              }
            )}
          </AppraisalSection>

          <AppraisalSection
            sectionKey="documentacion"
            title="Documentación"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid3}>
              {renderField('Factura', form.documentacion.factura, (e) => updateSectionField('documentacion', 'factura', e.target.value))}
              {renderField('Carta de origen', form.documentacion.cartaOrigen, (e) => updateSectionField('documentacion', 'cartaOrigen', e.target.value))}
              {renderField('Tenencias', form.documentacion.tenencias, (e) => updateSectionField('documentacion', 'tenencias', e.target.value))}
              {renderField('Último servicio', form.documentacion.ultimoServicio, (e) => updateSectionField('documentacion', 'ultimoServicio', e.target.value))}
              {renderField('Verificación', form.documentacion.verificacion, (e) => updateSectionField('documentacion', 'verificacion', e.target.value))}
              {renderField('Manuales', form.documentacion.manuales, (e) => updateSectionField('documentacion', 'manuales', e.target.value))}
              {renderField('Garantía', form.documentacion.garantia, (e) => updateSectionField('documentacion', 'garantia', e.target.value))}
              {renderField('Engomado', form.documentacion.engomado, (e) => updateSectionField('documentacion', 'engomado', e.target.value))}
              {renderField('Tarjeta de circulación', form.documentacion.tarjetaCirculacion, (e) => updateSectionField('documentacion', 'tarjetaCirculacion', e.target.value))}
              {renderField('Póliza de seguro', form.documentacion.polizaSeguro, (e) => updateSectionField('documentacion', 'polizaSeguro', e.target.value))}
            </div>
          </AppraisalSection>

          <AppraisalSection
            sectionKey="interior"
            title="Aspecto físico interior"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid3}>
              {renderField('Vestiduras', form.interior.vestiduras, (e) => updateSectionField('interior', 'vestiduras', e.target.value))}
              {renderField('Cielo', form.interior.cielo, (e) => updateSectionField('interior', 'cielo', e.target.value))}
              {renderField('Consola', form.interior.consola, (e) => updateSectionField('interior', 'consola', e.target.value))}
              {renderField('Alfombras', form.interior.alfombras, (e) => updateSectionField('interior', 'alfombras', e.target.value))}
              {renderField('Tablero', form.interior.tablero, (e) => updateSectionField('interior', 'tablero', e.target.value))}
              {renderField('Encendedor', form.interior.encendedor, (e) => updateSectionField('interior', 'encendedor', e.target.value))}
              {renderField('Puertas', form.interior.puertas, (e) => updateSectionField('interior', 'puertas', e.target.value))}
              {renderField('Volante', form.interior.volante, (e) => updateSectionField('interior', 'volante', e.target.value))}
              {renderField('Consola 2', form.interior.consolaDos, (e) => updateSectionField('interior', 'consolaDos', e.target.value))}
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
            {renderTextarea(
              'Observaciones de carrocería y neumáticos',
              form.carroceria.observaciones,
              (e) => updateSectionField('carroceria', 'observaciones', e.target.value)
            )}
          </AppraisalSection>

          <AppraisalSection
            sectionKey="sistemaElectrico"
            title="Sistema eléctrico"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            {renderCheckboxGrid('sistemaElectrico', [
              { key: 'espejosElectricos', label: 'Espejos eléctricos' },
              { key: 'bolsasAire', label: 'Bolsas de aire' },
              { key: 'aireAcondicionado', label: 'Aire acondicionado' },
              { key: 'controlCrucero', label: 'Control crucero' },
              { key: 'chisguetero', label: 'Chisguetero' },
              { key: 'luzMapa', label: 'Luz de mapa' },
              { key: 'funcionesVolante', label: 'Funciones en volante' },
              { key: 'checkEngine', label: 'Check engine' },
              { key: 'asientosElectricos', label: 'Asientos eléctricos' },
              { key: 'claxon', label: 'Claxon' },
              { key: 'lucesInternas', label: 'Luces internas' },
              { key: 'segurosElectricos', label: 'Seguros eléctricos' },
              { key: 'cristalesElectricos', label: 'Cristales eléctricos' },
              { key: 'aperturaCajuela', label: 'Apertura cajuela' },
              { key: 'pantalla', label: 'Pantalla' },
              { key: 'farosNiebla', label: 'Faros niebla' },
              { key: 'lucesExternas', label: 'Luces externas' },
              { key: 'limpiadores', label: 'Limpiadores' },
              { key: 'estereoUsb', label: 'Estéreo/CD/USB' },
              { key: 'quemacocos', label: 'Quemacocos' },
              { key: 'testigos', label: 'Testigos' },
              { key: 'direccionales', label: 'Direccionales' }
            ])}
          </AppraisalSection>

          <AppraisalSection
            sectionKey="fugasMotor"
            title="Fugas y motor"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid3}>
              {renderField('Motor', form.fugasMotor.motor, (e) => updateSectionField('fugasMotor', 'motor', e.target.value))}
              {renderField('Transmisión', form.fugasMotor.transmision, (e) => updateSectionField('fugasMotor', 'transmision', e.target.value))}
              {renderField('Sistema de frenos', form.fugasMotor.sistemaFrenos, (e) => updateSectionField('fugasMotor', 'sistemaFrenos', e.target.value))}
              {renderField('Dirección hidráulica', form.fugasMotor.direccionHidraulica, (e) => updateSectionField('fugasMotor', 'direccionHidraulica', e.target.value))}
              {renderField('Amortiguadores', form.fugasMotor.amortiguadores, (e) => updateSectionField('fugasMotor', 'amortiguadores', e.target.value))}
              {renderField('Anticongelante', form.fugasMotor.anticongelante, (e) => updateSectionField('fugasMotor', 'anticongelante', e.target.value))}
              {renderField('Aire acondicionado', form.fugasMotor.aireAcondicionado, (e) => updateSectionField('fugasMotor', 'aireAcondicionado', e.target.value))}
              {renderField('Flechas', form.fugasMotor.flechas, (e) => updateSectionField('fugasMotor', 'flechas', e.target.value))}
              {renderField('Soportes de motor', form.fugasMotor.soportesMotor, (e) => updateSectionField('fugasMotor', 'soportesMotor', e.target.value))}
              {renderField('Soportes de caja', form.fugasMotor.soportesCaja, (e) => updateSectionField('fugasMotor', 'soportesCaja', e.target.value))}
            </div>

            {renderTextarea(
              'Comentarios',
              form.fugasMotor.comentarios,
              (e) => updateSectionField('fugasMotor', 'comentarios', e.target.value)
            )}
          </AppraisalSection>

          <AppraisalSection
            sectionKey="valuacion"
            title="Valuación"
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            renderSectionStatus={renderSectionStatus}
          >
            <div style={styles.grid2}>
              {renderField('Toma libro', form.valuacion.tomaLibro, (e) => updateSectionField('valuacion', 'tomaLibro', e.target.value))}
              {renderField('Venta libro', form.valuacion.ventaLibro, (e) => updateSectionField('valuacion', 'ventaLibro', e.target.value))}
              {renderField('Reparaciones', form.valuacion.reparaciones, (e) => updateSectionField('valuacion', 'reparaciones', e.target.value))}
              {renderField('Toma autorizada', form.valuacion.tomaAutorizada, (e) => updateSectionField('valuacion', 'tomaAutorizada', e.target.value))}
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
    gridTemplateColumns: '290px 1fr',
    gap: '20px',
    alignItems: 'start'
  },
  sidebar: {
    background: '#fff',
    borderRadius: '20px',
    padding: '18px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '24px',
    alignSelf: 'start'
  },
  sidebarHeader: { marginBottom: '18px' },
  sidebarTitle: { margin: 0, fontSize: '22px', color: '#111827' },
  sidebarText: { margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' },
  sectionNav: { display: 'grid', gap: '10px' },
  sectionButton: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    background: '#fff',
    padding: '12px 14px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    fontWeight: 600
  },
  sectionButtonActive: {
    border: '1px solid #111827',
    background: '#f9fafb'
  },
  navStatus: {
    fontSize: '11px',
    fontWeight: 800,
    padding: '4px 8px',
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
  main: { display: 'grid', gap: '18px' },
  heroCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '22px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  formTitle: { margin: 0, fontSize: '36px', color: '#111827' },
  formMeta: { margin: '10px 0 0 0', color: '#6b7280', fontSize: '16px' },
  topbarActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  flowContainer: {
    display: 'grid',
    gap: '18px'
  },
  sectionCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.05)',
    border: '1px solid transparent'
  },
  sectionCardActive: {
    border: '1px solid #dbe3ee'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  sectionTitle: { margin: 0, fontSize: '24px', color: '#111827' },
  helperText: { margin: '8px 0 0 0', color: '#6b7280' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' },
  field: { display: 'grid', gap: '8px' },
  fieldFull: { display: 'grid', gap: '8px', marginTop: '16px' },
  label: { fontWeight: 700, fontSize: '14px', color: '#374151' },
  input: {
    width: '100%',
    padding: '13px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#fff'
  },
  inputDisabled: {
  width: '100%',
  padding: '13px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  fontSize: '14px',
  background: '#f3f4f6',
  color: '#6b7280',
  cursor: 'not-allowed'
},
  textarea: {
    width: '100%',
    padding: '13px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    resize: 'vertical',
    fontSize: '14px'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px'
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fafafa'
  },
  primaryButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 700
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 700
  },
  infoBox: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '14px 16px',
    borderRadius: '14px',
    fontWeight: 600,
    border: '1px solid #bfdbfe'
  },
  warningBox: {
    background: '#fff7ed',
    color: '#9a3412',
    padding: '14px 16px',
    borderRadius: '14px',
    fontWeight: 600,
    border: '1px solid #fed7aa',
    marginBottom: '16px'
  },
  notificationBox: {
  padding: '14px 16px',
  borderRadius: '14px',
  fontWeight: 700,
  border: '1px solid transparent',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
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
    gap: '16px'
  },
  generalPhotoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#fff'
  },
  generalPhotoPreview: {
    height: '190px',
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
    gap: '8px',
    color: '#6b7280'
  },
  silhouetteIcon: { fontSize: '28px' },
  silhouetteText: { fontSize: '14px', fontWeight: 700 },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  generalPhotoFooter: {
    padding: '12px',
    display: 'grid',
    gap: '10px'
  },
  slotActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  smallButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  smallDangerButton: {
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  detailPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginTop: '18px'
  },
  detailPhotoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#fff'
  },
  detailPhotoPreview: {
    height: '190px',
    background: '#f8fafc'
  },
  detailPhotoInfo: {
    padding: '12px',
    display: 'grid',
    gap: '10px'
  },
  detailPhotoName: {
    fontSize: '13px',
    color: '#111827',
    wordBreak: 'break-word'
  },
  emptyPhotoBox: {
    border: '1px dashed #d1d5db',
    borderRadius: '16px',
    padding: '24px',
    color: '#6b7280',
    textAlign: 'center'
  },
  validationGrid: { display: 'grid', gap: '12px' },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    background: '#fafafa'
  },
  statusPill: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
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
    background: '#fff',
    borderRadius: '20px',
    padding: '18px 20px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    position: 'sticky',
    bottom: '12px'
  },
  bottomBarText: {
    color: '#4b5563',
    fontWeight: 600
  }
};
