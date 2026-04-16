import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadAppraisalPhoto } from '../../services/appraisalPhotoService';

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

export default function AppraisalFormWorkspace({
  mode,
  initialData,
  onBack,
  onSaveDraft,
  onSaveIncomplete,
  onMarkComplete,
  saving = false
}) {
  const normalizedInitialData = useMemo(() => {
    const generalPhotosMap = {};
    generalPhotoSlots.forEach((slot) => {
      generalPhotosMap[slot.key] = null;
    });

    if (Array.isArray(initialData?.fotosGenerales)) {
      initialData.fotosGenerales.forEach((item, index) => {
        if (item?.slotKey) {
          generalPhotosMap[item.slotKey] = {
            ...item,
            preview: item.url || ''
          };
        } else {
          const slot = generalPhotoSlots[index];
          if (slot) {
            generalPhotosMap[slot.key] = {
              ...item,
              preview: item.url || ''
            };
          }
        }
      });
    }

    return {
      ...initialData,
      fotosGeneralesMap: generalPhotosMap,
      fotosDetalle: Array.isArray(initialData?.fotosDetalle)
        ? initialData.fotosDetalle.map((item) => ({
            ...item,
            preview: item.url || item.preview || ''
          }))
        : []
    };
  }, [initialData]);

  const [activeSection, setActiveSection] = useState('encabezado');
  const [form, setForm] = useState(normalizedInitialData);
  const [uploading, setUploading] = useState(false);
  const [localMessage, setLocalMessage] = useState('');
  const generalInputRefs = useRef({});
  const detailInputRef = useRef(null);

  useEffect(() => {
    setForm(normalizedInitialData);
  }, [normalizedInitialData]);

  useEffect(() => {
    if (!localMessage) return;
    const timer = setTimeout(() => setLocalMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [localMessage]);

  const updateRootField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSectionField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxField = (section, field) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const buildPayload = () => ({
    id: form.id,
    folio: form.folio,
    clienteNombre: form.clienteNombre,
    clienteTelefono: form.clienteTelefono,
    vehiculoInteres: form.vehiculoInteres,
    fechaAvaluo: form.fechaAvaluo,
    fechaActualizacion: form.fechaActualizacion,
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

  const ensureDraftBeforeUpload = async () => {
    if (form.id) return form.id;

    const payload = buildPayload();
    const result = await onSaveDraft(payload, { keepEditing: true });

    if (!result?.ok || !result?.appraisal) {
      throw new Error('No se pudo guardar el borrador antes de subir fotos');
    }

    setForm((prev) => ({
      ...prev,
      ...result.appraisal,
      fotosGeneralesMap: prev.fotosGeneralesMap,
      fotosDetalle: prev.fotosDetalle
    }));

    setLocalMessage('Se guardó el expediente como borrador para habilitar fotos.');
    return result.appraisal.id;
  };

  const handleGeneralPhotoClick = (slotKey) => {
    generalInputRefs.current[slotKey]?.click();
  };

  const handleGeneralPhotoChange = async (slotKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const appraisalId = await ensureDraftBeforeUpload();

      const res = await uploadAppraisalPhoto({
        appraisalId,
        photoType: 'general',
        slotKey,
        file
      });

      const uploaded = {
        slotKey,
        name: res.file.name,
        preview: res.file.url,
        url: res.file.url,
        fileName: res.file.fileName,
        path: res.file.path
      };

      setForm((prev) => ({
        ...prev,
        id: appraisalId,
        fotosGeneralesMap: {
          ...prev.fotosGeneralesMap,
          [slotKey]: uploaded
        }
      }));

      setLocalMessage('Foto general cargada correctamente.');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || 'Error al subir foto general');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleAddDetailPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);

      const appraisalId = await ensureDraftBeforeUpload();
      const uploadedPhotos = [];

      for (const file of files) {
        const res = await uploadAppraisalPhoto({
          appraisalId,
          photoType: 'detail',
          file
        });

        uploadedPhotos.push({
          name: res.file.name,
          preview: res.file.url,
          url: res.file.url,
          fileName: res.file.fileName,
          path: res.file.path
        });
      }

      setForm((prev) => ({
        ...prev,
        id: appraisalId,
        fotosDetalle: [...prev.fotosDetalle, ...uploadedPhotos]
      }));

      setLocalMessage('Fotos de detalle cargadas correctamente.');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || 'Error al subir fotos de detalle');
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

  const generalPhotosArray = useMemo(() => {
    return generalPhotoSlots
      .map((slot) => form.fotosGeneralesMap?.[slot.key])
      .filter(Boolean);
  }, [form.fotosGeneralesMap]);

  const validation = useMemo(() => {
    const requiredHeader =
      form.clienteNombre &&
      form.clienteTelefono &&
      form.vehiculoInteres &&
      form.fechaAvaluo;

    const requiredGenerales =
      form.generales.marca &&
      form.generales.subMarca &&
      form.generales.anioModelo &&
      form.generales.kilometraje;

    const requiredValuacion =
      form.valuacion.tomaLibro &&
      form.valuacion.ventaLibro &&
      form.valuacion.tomaAutorizada;

    const requiredPhotos =
      generalPhotosArray.length >= 7 &&
      form.fotosDetalle.length >= 1;

    return {
      requiredHeader,
      requiredGenerales,
      requiredValuacion,
      requiredPhotos,
      canComplete:
        requiredHeader &&
        requiredGenerales &&
        requiredValuacion &&
        requiredPhotos
    };
  }, [form, generalPhotosArray]);

  const renderStatusPill = (status) => {
    const map = {
      pendiente: { background: '#e5e7eb', color: '#374151' },
      incompleto: { background: '#fef3c7', color: '#92400e' },
      listo: { background: '#dcfce7', color: '#166534' }
    };

    return (
      <span style={{ ...styles.statusPill, ...map[status] }}>
        {status}
      </span>
    );
  };

  const renderField = (label, value, onChange, type = 'text') => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={onChange} style={styles.input} />
    </div>
  );

  const renderTextarea = (label, value, onChange) => (
    <div style={styles.fieldFull}>
      <label style={styles.label}>{label}</label>
      <textarea value={value} onChange={onChange} style={styles.textarea} rows={4} />
    </div>
  );

  const renderCheckboxGrid = (section, fields) => (
    <div style={styles.checkboxGrid}>
      {fields.map(({ key, label }) => (
        <label key={key} style={styles.checkboxItem}>
          <input
            type="checkbox"
            checked={!!form[section][key]}
            onChange={() => handleCheckboxField(section, key)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'encabezado':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Encabezado</h3>
            <div style={styles.grid2}>
              {renderField('Folio', form.folio, (e) => updateRootField('folio', e.target.value))}
              {renderField('Asesor de ventas', form.asesorVentas, (e) => updateRootField('asesorVentas', e.target.value))}
              {renderField('Nombre del cliente', form.clienteNombre, (e) => updateRootField('clienteNombre', e.target.value))}
              {renderField('Teléfono', form.clienteTelefono, (e) => updateRootField('clienteTelefono', e.target.value))}
              {renderField('Vehículo de interés', form.vehiculoInteres, (e) => updateRootField('vehiculoInteres', e.target.value))}
              {renderField('Fecha de avalúo', form.fechaAvaluo, (e) => updateRootField('fechaAvaluo', e.target.value), 'date')}
            </div>
          </div>
        );

      case 'generales':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Generales del vehículo</h3>
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
          </div>
        );

      case 'documentacion':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Documentación</h3>
            <div style={styles.grid3}>
              {renderField('Factura', form.documentacion.factura, (e) => updateSectionField('documentacion', 'factura', e.target.value))}
              {renderField('C. de origen', form.documentacion.cartaOrigen, (e) => updateSectionField('documentacion', 'cartaOrigen', e.target.value))}
              {renderField('Tenencias', form.documentacion.tenencias, (e) => updateSectionField('documentacion', 'tenencias', e.target.value))}
              {renderField('Últ. servicio', form.documentacion.ultimoServicio, (e) => updateSectionField('documentacion', 'ultimoServicio', e.target.value))}
              {renderField('Verificación', form.documentacion.verificacion, (e) => updateSectionField('documentacion', 'verificacion', e.target.value))}
              {renderField('Manuales', form.documentacion.manuales, (e) => updateSectionField('documentacion', 'manuales', e.target.value))}
              {renderField('Garantía', form.documentacion.garantia, (e) => updateSectionField('documentacion', 'garantia', e.target.value))}
              {renderField('Engomado', form.documentacion.engomado, (e) => updateSectionField('documentacion', 'engomado', e.target.value))}
              {renderField('Tarjeta circ.', form.documentacion.tarjetaCirculacion, (e) => updateSectionField('documentacion', 'tarjetaCirculacion', e.target.value))}
              {renderField('Póliza seguro', form.documentacion.polizaSeguro, (e) => updateSectionField('documentacion', 'polizaSeguro', e.target.value))}
            </div>
          </div>
        );

      case 'interior':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Aspecto físico interior</h3>
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
          </div>
        );

      case 'carroceria':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Carrocería y neumáticos</h3>
            <p style={styles.helperText}>
              Aquí montaremos después el esquema visual completo del vehículo, daños y neumáticos.
              Por ahora deja observaciones detalladas.
            </p>

            {renderTextarea(
              'Observaciones de carrocería y neumáticos',
              form.carroceria.observaciones,
              (e) => updateSectionField('carroceria', 'observaciones', e.target.value)
            )}
          </div>
        );

      case 'sistemaElectrico':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Sistema eléctrico</h3>

            {renderCheckboxGrid('sistemaElectrico', [
              { key: 'espejosElectricos', label: 'Espejos eléctricos' },
              { key: 'bolsasAire', label: 'Bolsas de aire' },
              { key: 'aireAcondicionado', label: 'Aire acondicionado' },
              { key: 'controlCrucero', label: 'Control crucero' },
              { key: 'chisguetero', label: 'Chisguetero' },
              { key: 'luzMapa', label: 'Luz de mapa' },
              { key: 'funcionesVolante', label: 'Funciones volante' },
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
          </div>
        );

      case 'fugasMotor':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Fugas y motor</h3>

            <div style={styles.grid3}>
              {renderField('Motor', form.fugasMotor.motor, (e) => updateSectionField('fugasMotor', 'motor', e.target.value))}
              {renderField('Transmisión', form.fugasMotor.transmision, (e) => updateSectionField('fugasMotor', 'transmision', e.target.value))}
              {renderField('Sistema de frenos', form.fugasMotor.sistemaFrenos, (e) => updateSectionField('fugasMotor', 'sistemaFrenos', e.target.value))}
              {renderField('Dir. hidráulica', form.fugasMotor.direccionHidraulica, (e) => updateSectionField('fugasMotor', 'direccionHidraulica', e.target.value))}
              {renderField('Amortiguadores', form.fugasMotor.amortiguadores, (e) => updateSectionField('fugasMotor', 'amortiguadores', e.target.value))}
              {renderField('Anticongelante', form.fugasMotor.anticongelante, (e) => updateSectionField('fugasMotor', 'anticongelante', e.target.value))}
              {renderField('Aire acondicionado', form.fugasMotor.aireAcondicionado, (e) => updateSectionField('fugasMotor', 'aireAcondicionado', e.target.value))}
              {renderField('Flechas', form.fugasMotor.flechas, (e) => updateSectionField('fugasMotor', 'flechas', e.target.value))}
              {renderField('Soportes de motor', form.fugasMotor.soportesMotor, (e) => updateSectionField('fugasMotor', 'soportesMotor', e.target.value))}
              {renderField('Soportes caja', form.fugasMotor.soportesCaja, (e) => updateSectionField('fugasMotor', 'soportesCaja', e.target.value))}
            </div>

            {renderTextarea(
              'Comentarios',
              form.fugasMotor.comentarios,
              (e) => updateSectionField('fugasMotor', 'comentarios', e.target.value)
            )}
          </div>
        );

      case 'valuacion':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Valuación</h3>
            <div style={styles.grid2}>
              {renderField('Toma libro', form.valuacion.tomaLibro, (e) => updateSectionField('valuacion', 'tomaLibro', e.target.value))}
              {renderField('Venta libro', form.valuacion.ventaLibro, (e) => updateSectionField('valuacion', 'ventaLibro', e.target.value))}
              {renderField('$ Reparaciones', form.valuacion.reparaciones, (e) => updateSectionField('valuacion', 'reparaciones', e.target.value))}
              {renderField('Toma autorizada', form.valuacion.tomaAutorizada, (e) => updateSectionField('valuacion', 'tomaAutorizada', e.target.value))}
            </div>
          </div>
        );

      case 'fotosGenerales':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Fotos generales</h3>
            {!form.id && (
              <div style={styles.warningBox}>
                Al cargar la primera foto, el sistema guardará automáticamente este avalúo como borrador.
              </div>
            )}

            {localMessage && (
              <div style={styles.inlineSuccessBox}>
                {localMessage}
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
                        <button type="button" style={styles.smallButton} onClick={() => handleGeneralPhotoClick(slot.key)}>
                          {photo ? 'Reemplazar' : 'Capturar'}
                        </button>

                        {photo && (
                          <button type="button" style={styles.smallDangerButton} onClick={() => removeGeneralPhoto(slot.key)}>
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'fotosDetalle':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Fotos de detalle</h3>
            {!form.id && (
              <div style={styles.warningBox}>
                Al cargar la primera foto, el sistema guardará automáticamente este avalúo como borrador.
              </div>
            )}

            {localMessage && (
              <div style={styles.inlineSuccessBox}>
                {localMessage}
              </div>
            )}

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
              onClick={() => detailInputRef.current?.click()}
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
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'revisionFinal':
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Revisión final</h3>
            <div style={styles.validationGrid}>
              <div style={styles.validationItem}>
                <strong>Encabezado</strong>
                {renderStatusPill(validation.requiredHeader ? 'listo' : 'incompleto')}
              </div>
              <div style={styles.validationItem}>
                <strong>Generales</strong>
                {renderStatusPill(validation.requiredGenerales ? 'listo' : 'incompleto')}
              </div>
              <div style={styles.validationItem}>
                <strong>Valuación</strong>
                {renderStatusPill(validation.requiredValuacion ? 'listo' : 'incompleto')}
              </div>
              <div style={styles.validationItem}>
                <strong>Fotos requeridas</strong>
                {renderStatusPill(validation.requiredPhotos ? 'listo' : 'incompleto')}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Sección en preparación</h3>
            <p style={styles.helperText}>La conectamos en el siguiente bloque.</p>
          </div>
        );
    }
  };

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
              style={{
                ...styles.sectionButton,
                ...(activeSection === section.key ? styles.sectionButtonActive : {})
              }}
              onClick={() => setActiveSection(section.key)}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.formTitle}>{form.folio}</h1>
            <p style={styles.formMeta}>
              Cliente: {form.clienteNombre || '-'} · Estatus actual: {form.estatus}
            </p>
          </div>

          <div style={styles.topbarActions}>
            <button style={styles.secondaryButton} onClick={onBack} disabled={saving || uploading}>
              Volver
            </button>
            <button style={styles.secondaryButton} onClick={() => onSaveDraft(buildPayload())} disabled={saving || uploading}>
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button style={styles.secondaryButton} onClick={() => onSaveIncomplete(buildPayload())} disabled={saving || uploading}>
              Guardar incompleto
            </button>
            <button
              style={validation.canComplete ? styles.primaryButton : styles.disabledButton}
              onClick={() => validation.canComplete && onMarkComplete(buildPayload())}
              disabled={saving || uploading || !validation.canComplete}
            >
              {uploading ? 'Subiendo...' : 'Marcar completo'}
            </button>
          </div>
        </div>

        {renderSectionContent()}
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
    borderRadius: '18px',
    padding: '18px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '24px'
  },
  sidebarHeader: { marginBottom: '18px' },
  sidebarTitle: { margin: 0, fontSize: '20px' },
  sidebarText: { margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' },
  sectionNav: { display: 'grid', gap: '10px' },
  sectionButton: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    padding: '12px',
    cursor: 'pointer'
  },
  sectionButtonActive: {
    border: '1px solid #111827',
    background: '#f9fafb'
  },
  main: { display: 'grid', gap: '18px' },
  topbar: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  formTitle: { margin: 0, fontSize: '28px' },
  formMeta: { margin: '8px 0 0 0', color: '#6b7280' },
  topbarActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  sectionCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  sectionTitle: { marginTop: 0, marginBottom: '20px', fontSize: '22px' },
  helperText: { color: '#6b7280', marginTop: 0, marginBottom: '18px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' },
  field: { display: 'grid', gap: '8px' },
  fieldFull: { display: 'grid', gap: '8px', marginTop: '16px' },
  label: { fontWeight: 600, fontSize: '14px' },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '10px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    resize: 'vertical'
  },
  validationGrid: { display: 'grid', gap: '12px' },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px'
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
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px'
  },
  statusPill: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700
  },
  primaryButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 600
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 600
  },
  disabledButton: {
    background: '#9ca3af',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'not-allowed',
    fontWeight: 600
  },
  warningBox: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontWeight: 600
  },
  inlineSuccessBox: {
    background: '#dcfce7',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontWeight: 600
  },
  generalPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px'
  },
  generalPhotoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden'
  },
  generalPhotoPreview: {
    height: '180px',
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
  silhouetteText: { fontSize: '14px', fontWeight: 600 },
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
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12px'
  },
  smallDangerButton: {
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 600,
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
    borderRadius: '14px',
    overflow: 'hidden'
  },
  detailPhotoPreview: {
    height: '180px',
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
    borderRadius: '14px',
    padding: '24px',
    color: '#6b7280',
    textAlign: 'center'
  }
};