import { useEffect, useMemo, useState } from 'react';
import { downloadAppraisalPhotosZip } from '../../services/appraisalPhotoService';
import {
  getAppraisalHistory,
  downloadAppraisalPdf
} from '../../services/appraisalService';

const sectionTitles = {
  frente: 'Frente',
  costadoIzquierdo: 'Costado izquierdo',
  costadoDerecho: 'Costado derecho',
  trasera: 'Parte trasera',
  techo: 'Techo',
  parabrisas: 'Parabrisas'
};

const damageLabels = {
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

const tirePositionLabels = {
  delanteraIzquierda: 'Delantera izquierda',
  delanteraDerecha: 'Delantera derecha',
  traseraIzquierda: 'Trasera izquierda',
  traseraDerecha: 'Trasera derecha'
};

const tireStateLabels = {
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

const generalPhotoOrder = [
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

const generalPhotoLabels = {
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

async function downloadPhoto(photo, fallbackName = 'foto.jpg') {
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

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(numeric);
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const formatHistoryDateTime = (value) => {
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

const toDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const formatYesNoNa = (value) => yesNoNaLabels[value] || '-';
const formatTechnical = (value) => technicalLabels[value] || '-';
const formatDamage = (value) => damageLabels[value] || value;
const formatTireState = (value) => tireStateLabels[value] || '-';

const formatHistoryAction = (action) => {
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

const getHistoryAccent = (action) => {
  const accents = {
    CREATED: {
      bg: '#dcfce7',
      border: '#86efac',
      text: '#166534'
    },
    UPDATED: {
      bg: '#dbeafe',
      border: '#93c5fd',
      text: '#1d4ed8'
    },
    STATUS_CHANGED: {
      bg: '#fef3c7',
      border: '#fcd34d',
      text: '#92400e'
    },
    COMPLETED_RECORD_EDITED: {
      bg: '#fee2e2',
      border: '#fca5a5',
      text: '#991b1b'
    },
    GENERAL_PHOTO_UPLOADED: {
      bg: '#ede9fe',
      border: '#c4b5fd',
      text: '#6d28d9'
    },
    DETAIL_PHOTO_UPLOADED: {
      bg: '#fce7f3',
      border: '#f9a8d4',
      text: '#9d174d'
    }
  };

  return (
    accents[action] || {
      bg: '#f1f5f9',
      border: '#cbd5e1',
      text: '#334155'
    }
  );
};

const renderStatusBadge = (status) => {
  const map = {
    borrador: styles.badgeDraft,
    incompleto: styles.badgeWarning,
    completo: styles.badgeSuccess
  };

  return (
    <span style={{ ...styles.badge, ...(map[status] || styles.badgeDraft) }}>
      {status || '-'}
    </span>
  );
};

const DetailItem = ({ label, value, mono = false }) => (
  <div style={styles.detailItem}>
    <span style={styles.detailLabel}>{label}</span>
    <span style={{ ...styles.detailValue, ...(mono ? styles.monoValue : {}) }}>
      {value}
    </span>
  </div>
);

const SectionCard = ({ title, subtitle, children, right }) => (
  <section style={styles.sectionCard}>
    <div style={styles.sectionHeader}>
      <div>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {subtitle ? <p style={styles.sectionSubtitle}>{subtitle}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
    {children}
  </section>
);

export default function AppraisalDetailModal({ abierto, appraisal, onClose }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const generalPhotos = useMemo(() => {
    const photos = Array.isArray(appraisal?.fotosGenerales)
      ? appraisal.fotosGenerales
      : [];

    return [...photos].sort((a, b) => {
      const ai = generalPhotoOrder.indexOf(a.slotKey);
      const bi = generalPhotoOrder.indexOf(b.slotKey);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [appraisal]);

  const detailPhotos = useMemo(() => {
    return Array.isArray(appraisal?.fotosDetalle)
      ? appraisal.fotosDetalle
      : [];
  }, [appraisal]);

  useEffect(() => {
    if (!abierto || !appraisal?.id) return;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await getAppraisalHistory(appraisal.id);

        if (!cancelled) {
          setHistory(response?.data || []);
        }
      } catch (error) {
        console.error('Error al cargar historial:', error);
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [abierto, appraisal?.id]);

  if (!abierto || !appraisal) return null;

  async function downloadZip(appraisalId, photoType) {
    try {
      const result = await downloadAppraisalPhotosZip({ appraisalId, photoType });
      const blob = result?.blob;

      if (!blob) {
        throw new Error('No se recibió el archivo ZIP');
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const fileName =
        photoType === 'general'
          ? `avaluo_${appraisalId}_fotos_generales.zip`
          : `avaluo_${appraisalId}_fotos_detalle.zip`;

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error al descargar ZIP:', error);
      alert('No se pudo descargar el ZIP.');
    }
  }

  async function handleDownloadPdf() {
    try {
      if (!appraisal?.id) {
        throw new Error('No hay avalúo disponible para descargar');
      }

      const result = await downloadAppraisalPdf(appraisal.id);
      const blob = result?.blob;

      if (!blob) {
        throw new Error('No se recibió el PDF');
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `avaluo_${appraisal.folio || appraisal.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('No se pudo descargar el PDF.');
    }
  }

  const carroceriaZonas = appraisal.carroceria?.zonas || {};
  const carroceriaNeumaticos = appraisal.carroceria?.neumaticos || {};

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.hero}>
            <div>
              <p style={styles.heroEyebrow}>Reporte profesional de avalúo</p>
              <h2 style={styles.heroTitle}>{appraisal.folio || 'Detalle del avalúo'}</h2>
              <div style={styles.heroMeta}>
                <span>{appraisal.clienteNombre || 'Sin cliente'}</span>
                <span>•</span>
                <span>{appraisal.vehiculoInteres || 'Sin vehículo de interés'}</span>
              </div>
            </div>

            <div style={styles.heroActions}>
              <button style={styles.secondaryButton} onClick={handleDownloadPdf}>
                Descargar PDF
              </button>
              {renderStatusBadge(appraisal.estatus)}
              <button style={styles.closeButton} onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>

          <div style={styles.body}>
            <SectionCard title="Resumen ejecutivo" subtitle="Datos principales del expediente.">
              <div style={styles.summaryGrid}>
                <DetailItem label="Cliente" value={toDisplayValue(appraisal.clienteNombre)} />
                <DetailItem label="Teléfono" value={toDisplayValue(appraisal.clienteTelefono)} mono />
                <DetailItem label="Vehículo de interés" value={toDisplayValue(appraisal.vehiculoInteres)} />
                <DetailItem label="Fecha de avalúo" value={formatDate(appraisal.fechaAvaluo)} />
                <DetailItem label="Asesor" value={toDisplayValue(appraisal.asesorVentas)} />
                <DetailItem label="Fecha de actualización" value={formatDate(appraisal.fechaActualizacion)} />
              </div>
            </SectionCard>

            <SectionCard title="Generales del vehículo" subtitle="Información base capturada para valuación.">
              <div style={styles.dataGrid}>
                <DetailItem label="Marca" value={toDisplayValue(appraisal.generales?.marca)} />
                <DetailItem label="Submarca" value={toDisplayValue(appraisal.generales?.submarca ?? appraisal.generales?.subMarca)} />
                <DetailItem label="Versión" value={toDisplayValue(appraisal.generales?.version)} />
                <DetailItem label="Año modelo" value={toDisplayValue(appraisal.generales?.anio ?? appraisal.generales?.anioModelo)} />
                <DetailItem label="Transmisión" value={toDisplayValue(appraisal.generales?.transmision)} />
                <DetailItem label="Color" value={toDisplayValue(appraisal.generales?.color)} />
                <DetailItem label="Kilometraje" value={toDisplayValue(appraisal.generales?.kilometraje)} />
                <DetailItem
                  label="Número de dueños"
                  value={toDisplayValue(
                    appraisal.generales?.numeroDuenos ?? appraisal.generales?.numeroDuenios
                  )}
                />
                <DetailItem label="Número de serie" value={toDisplayValue(appraisal.generales?.numeroSerie)} mono />
                <DetailItem label="Placas" value={toDisplayValue(appraisal.generales?.placas)} mono />
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.generales?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Documentación" subtitle="Estado documental del vehículo al momento del avalúo.">
              <div style={styles.statusGrid}>
                <DetailItem label="Factura" value={formatYesNoNa(appraisal.documentacion?.factura)} />
                <DetailItem label="Carta de origen" value={formatYesNoNa(appraisal.documentacion?.cartaOrigen)} />
                <DetailItem label="Tenencias" value={formatYesNoNa(appraisal.documentacion?.tenencias)} />
                <DetailItem label="Último servicio" value={formatYesNoNa(appraisal.documentacion?.ultimoServicio)} />
                <DetailItem label="Verificación" value={formatYesNoNa(appraisal.documentacion?.verificacion)} />
                <DetailItem label="Manuales" value={formatYesNoNa(appraisal.documentacion?.manuales)} />
                <DetailItem label="Garantía" value={formatYesNoNa(appraisal.documentacion?.garantia)} />
                <DetailItem label="Engomado" value={formatYesNoNa(appraisal.documentacion?.engomado)} />
                <DetailItem label="Tarjeta de circulación" value={formatYesNoNa(appraisal.documentacion?.tarjetaCirculacion)} />
                <DetailItem label="Póliza de seguro" value={formatYesNoNa(appraisal.documentacion?.polizaSeguro)} />
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.documentacion?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Aspecto físico interior" subtitle="Evaluación visual del estado interior.">
              <div style={styles.statusGrid}>
                <DetailItem label="Vestiduras" value={toDisplayValue(appraisal.interior?.vestiduras)} />
                <DetailItem label="Cielo" value={toDisplayValue(appraisal.interior?.cielo)} />
                <DetailItem label="Consola central" value={toDisplayValue(appraisal.interior?.consolaCentral ?? appraisal.interior?.consola)} />
                <DetailItem label="Alfombras" value={toDisplayValue(appraisal.interior?.alfombras)} />
                <DetailItem label="Tablero" value={toDisplayValue(appraisal.interior?.tablero)} />
                <DetailItem label="Encendedor / toma corriente" value={toDisplayValue(appraisal.interior?.encendedor)} />
                <DetailItem label="Puertas / vestiduras laterales" value={toDisplayValue(appraisal.interior?.puertasLaterales ?? appraisal.interior?.puertas)} />
                <DetailItem label="Volante" value={toDisplayValue(appraisal.interior?.volante)} />
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.interior?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Carrocería y neumáticos" subtitle="Hallazgos por zona y condición de neumáticos/rines.">
              <div style={styles.twoColumnLayout}>
                <div style={styles.subCard}>
                  <h4 style={styles.subCardTitle}>Carrocería por zonas</h4>
                  <div style={styles.zoneGrid}>
                    {Object.keys(sectionTitles).map((zoneKey) => {
                      const items = Array.isArray(carroceriaZonas?.[zoneKey])
                        ? carroceriaZonas[zoneKey]
                        : [];

                      return (
                        <div key={zoneKey} style={styles.zoneCard}>
                          <span style={styles.zoneTitle}>{sectionTitles[zoneKey]}</span>
                          {items.length ? (
                            <div style={styles.chips}>
                              {items.map((item) => (
                                <span key={`${zoneKey}-${item}`} style={styles.chip}>
                                  {formatDamage(item)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={styles.emptyText}>Sin hallazgos registrados</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.subCard}>
                  <h4 style={styles.subCardTitle}>Neumáticos y rines</h4>
                  <div style={styles.tireReportGrid}>
                    {Object.keys(tirePositionLabels).map((positionKey) => {
                      const current = carroceriaNeumaticos?.[positionKey] || {};

                      return (
                        <div key={positionKey} style={styles.tireReportCard}>
                          <span style={styles.zoneTitle}>{tirePositionLabels[positionKey]}</span>
                          <DetailItem label="Neumático" value={formatTireState(current.neumatico)} />
                          <DetailItem label="Rin" value={formatTireState(current.rin)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.carroceria?.observaciones)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Sistema eléctrico" subtitle="Validación funcional de elementos eléctricos y de equipamiento.">
              <div style={styles.statusGrid}>
                <DetailItem label="Espejos eléctricos" value={formatYesNoNa(appraisal.sistemaElectrico?.espejosElectricos)} />
                <DetailItem label="Bolsas de aire" value={formatYesNoNa(appraisal.sistemaElectrico?.bolsasAire)} />
                <DetailItem label="Aire acondicionado" value={formatYesNoNa(appraisal.sistemaElectrico?.aireAcondicionado)} />
                <DetailItem label="Control de crucero" value={formatYesNoNa(appraisal.sistemaElectrico?.controlCrucero)} />
                <DetailItem label="Chisguetero" value={formatYesNoNa(appraisal.sistemaElectrico?.chisguetero)} />
                <DetailItem label="Luz de mapa" value={formatYesNoNa(appraisal.sistemaElectrico?.luzMapa)} />
                <DetailItem label="Controles de volante" value={formatYesNoNa(appraisal.sistemaElectrico?.controlesVolante ?? appraisal.sistemaElectrico?.funcionesVolante)} />
                <DetailItem label="Check engine" value={formatYesNoNa(appraisal.sistemaElectrico?.checkEngine)} />
                <DetailItem label="Asientos eléctricos" value={formatYesNoNa(appraisal.sistemaElectrico?.asientosElectricos)} />
                <DetailItem label="Encendedor" value={formatYesNoNa(appraisal.sistemaElectrico?.encendedor)} />
                <DetailItem label="Claxon" value={formatYesNoNa(appraisal.sistemaElectrico?.claxon)} />
                <DetailItem label="Luces internas" value={formatYesNoNa(appraisal.sistemaElectrico?.lucesInternas)} />
                <DetailItem label="Seguros eléctricos" value={formatYesNoNa(appraisal.sistemaElectrico?.segurosElectricos)} />
                <DetailItem label="Cristales eléctricos" value={formatYesNoNa(appraisal.sistemaElectrico?.cristalesElectricos)} />
                <DetailItem label="Apertura cajuela" value={formatYesNoNa(appraisal.sistemaElectrico?.aperturaCajuela)} />
                <DetailItem label="Pantalla" value={formatYesNoNa(appraisal.sistemaElectrico?.pantalla)} />
                <DetailItem label="Faros de niebla" value={formatYesNoNa(appraisal.sistemaElectrico?.farosNiebla)} />
                <DetailItem label="Luces externas" value={formatYesNoNa(appraisal.sistemaElectrico?.lucesExternas)} />
                <DetailItem label="Limpiadores" value={formatYesNoNa(appraisal.sistemaElectrico?.limpiadores)} />
                <DetailItem label="Estéreo / USB" value={formatYesNoNa(appraisal.sistemaElectrico?.estereoUsb)} />
                <DetailItem label="Quemacocos" value={formatYesNoNa(appraisal.sistemaElectrico?.quemacocos)} />
                <DetailItem label="Testigos" value={formatYesNoNa(appraisal.sistemaElectrico?.testigos)} />
                <DetailItem label="Direccionales" value={formatYesNoNa(appraisal.sistemaElectrico?.direccionales)} />
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.sistemaElectrico?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Fugas y motor" subtitle="Estado técnico de componentes y posibles detalles mecánicos.">
              <div style={styles.statusGrid}>
                <DetailItem label="Motor" value={formatTechnical(appraisal.fugasMotor?.motor)} />
                <DetailItem label="Transmisión" value={formatTechnical(appraisal.fugasMotor?.transmision)} />
                <DetailItem label="Sistema de frenos" value={formatTechnical(appraisal.fugasMotor?.sistemaFrenos)} />
                <DetailItem label="Dirección hidráulica" value={formatTechnical(appraisal.fugasMotor?.direccionHidraulica)} />
                <DetailItem label="Amortiguadores" value={formatTechnical(appraisal.fugasMotor?.amortiguadores)} />
                <DetailItem label="Anticongelante" value={formatTechnical(appraisal.fugasMotor?.anticongelante)} />
                <DetailItem label="Aire acondicionado" value={formatTechnical(appraisal.fugasMotor?.aireAcondicionado)} />
                <DetailItem label="Flechas" value={formatTechnical(appraisal.fugasMotor?.flechas)} />
                <DetailItem label="Soportes de motor" value={formatTechnical(appraisal.fugasMotor?.soportesMotor)} />
                <DetailItem label="Soportes de caja" value={formatTechnical(appraisal.fugasMotor?.soportesCaja)} />
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.fugasMotor?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Valuación" subtitle="Referencias económicas y monto autorizado de toma.">
              <div style={styles.valuationGrid}>
                <div style={styles.valuationCard}>
                  <span style={styles.valuationLabel}>Toma libro</span>
                  <span style={styles.valuationValue}>{formatMoney(appraisal.valuacion?.tomaLibro)}</span>
                </div>
                <div style={styles.valuationCard}>
                  <span style={styles.valuationLabel}>Venta libro</span>
                  <span style={styles.valuationValue}>{formatMoney(appraisal.valuacion?.ventaLibro)}</span>
                </div>
                <div style={styles.valuationCard}>
                  <span style={styles.valuationLabel}>Media</span>
                  <span style={styles.valuationValue}>{formatMoney(appraisal.valuacion?.media)}</span>
                </div>
                <div style={styles.valuationCard}>
                  <span style={styles.valuationLabel}>Reparaciones</span>
                  <span style={styles.valuationValue}>{formatMoney(appraisal.valuacion?.reparaciones)}</span>
                </div>
                <div style={styles.valuationCard}>
                  <span style={styles.valuationLabel}>Toma autorizada</span>
                  <span style={styles.valuationValue}>{formatMoney(appraisal.valuacion?.tomaAutorizada)}</span>
                </div>
              </div>

              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Comentarios</span>
                <p style={styles.commentText}>{toDisplayValue(appraisal.valuacion?.comentarios)}</p>
              </div>
            </SectionCard>

            <SectionCard
              title="Fotos generales"
              subtitle="Vista previa de imágenes principales del expediente."
              right={
                <button
                  style={styles.downloadButton}
                  onClick={() => downloadZip(appraisal.id, 'general')}
                  disabled={!generalPhotos.length}
                >
                  Descargar generales ZIP
                </button>
              }
            >
              {generalPhotos.length ? (
                <div style={styles.photoGrid}>
                  {generalPhotos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} style={styles.photoCard}>
                      <div style={styles.photoPreview}>
                        {photo.url || photo.preview ? (
                          <img
                            src={photo.url || photo.preview}
                            alt={photo.name}
                            style={styles.previewImage}
                            onClick={() => setPreviewImage(photo.url || photo.preview)}
                          />
                        ) : (
                          <div style={styles.noPreview}>Sin vista previa</div>
                        )}
                      </div>
                      <div style={styles.photoFooter}>
                        <span style={styles.photoTag}>
                          {generalPhotoLabels[photo.slotKey] || 'Foto general'}
                        </span>
                        <span style={styles.photoName}>
                          {photo.name || `General ${index + 1}`}
                        </span>
                        {photo.url || photo.preview ? (
                          <button
                            style={styles.smallButton}
                            onClick={() => downloadPhoto(photo, photo.name)}
                          >
                            Descargar imagen
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>No hay fotos generales.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Fotos de detalle"
              subtitle="Daños, piezas o evidencia adicional del avalúo."
              right={
                <button
                  style={styles.downloadButton}
                  onClick={() => downloadZip(appraisal.id, 'detail')}
                  disabled={!detailPhotos.length}
                >
                  Descargar detalle ZIP
                </button>
              }
            >
              {detailPhotos.length ? (
                <div style={styles.photoGrid}>
                  {detailPhotos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} style={styles.photoCard}>
                      <div style={styles.photoPreview}>
                        {photo.url || photo.preview ? (
                          <img
                            src={photo.url || photo.preview}
                            alt={photo.name}
                            style={styles.previewImage}
                            onClick={() => setPreviewImage(photo.url || photo.preview)}
                          />
                        ) : (
                          <div style={styles.noPreview}>Sin vista previa</div>
                        )}
                      </div>
                      <div style={styles.photoFooter}>
                        <span style={styles.photoTag}>Detalle</span>
                        <span style={styles.photoName}>
                          {photo.name || `Detalle ${index + 1}`}
                        </span>
                        {photo.url || photo.preview ? (
                          <button
                            style={styles.smallButton}
                            onClick={() => downloadPhoto(photo, photo.name)}
                          >
                            Descargar imagen
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>No hay fotos de detalle.</p>
              )}
            </SectionCard>

            <SectionCard title="Historial" subtitle="Bitácora real de cambios del expediente.">
              {historyLoading ? (
                <p style={styles.emptyText}>Cargando historial...</p>
              ) : history.length ? (
                <div style={styles.historyList}>
                  {history.map((item) => {
                    const accent = getHistoryAccent(item.accion);

                    return (
                      <div key={item.id} style={styles.historyCard}>
                        <div style={styles.historyTopRow}>
                          <span style={styles.historyDate}>
                            {formatHistoryDateTime(item.created_at)}
                          </span>

                          <span
                            style={{
                              ...styles.historyBadge,
                              background: accent.bg,
                              borderColor: accent.border,
                              color: accent.text
                            }}
                          >
                            {formatHistoryAction(item.accion)}
                          </span>
                        </div>

                        <div style={styles.historyBody}>
                          <div style={styles.historyUser}>
                            {toDisplayValue(item.usuario_nombre)}
                          </div>

                          <div style={styles.historyDetailText}>
                            {toDisplayValue(item.detalle)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={styles.emptyText}>Sin historial.</p>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      {previewImage ? (
        <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
          <div style={styles.previewContainer} onClick={(e) => e.stopPropagation()}>
            <button style={styles.previewCloseButton} onClick={() => setPreviewImage(null)}>
              ✕
            </button>
            <img src={previewImage} alt="preview" style={styles.previewLargeImage} />
          </div>
        </div>
      ) : null}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.58)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 2000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    width: '100%',
    maxWidth: '1360px',
    maxHeight: '92vh',
    overflow: 'auto',
    background: '#f8fafc',
    borderRadius: '24px',
    boxShadow: '0 30px 80px rgba(15,23,42,0.28)',
    border: '1px solid rgba(255,255,255,0.4)'
  },
  hero: {
    padding: '26px 28px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 5
  },
  heroEyebrow: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  heroTitle: {
    margin: '8px 0 0 0',
    fontSize: '34px',
    lineHeight: 1.05,
    color: '#0f172a'
  },
  heroMeta: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    color: '#475569',
    fontWeight: 600
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '13px',
    textTransform: 'capitalize'
  },
  badgeDraft: {
    background: '#fff7ed',
    color: '#9a3412'
  },
  badgeWarning: {
    background: '#fef3c7',
    color: '#92400e'
  },
  badgeSuccess: {
    background: '#dcfce7',
    color: '#166534'
  },
  closeButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  body: {
    padding: '24px',
    display: 'grid',
    gap: '18px'
  },
  sectionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '20px',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(15,23,42,0.04)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#0f172a'
  },
  sectionSubtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '14px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px'
  },
  detailItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px 16px',
    display: 'grid',
    gap: '8px',
    background: '#f8fafc'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.35
  },
  monoValue: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  commentBox: {
    marginTop: '16px',
    border: '1px dashed #cbd5e1',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#f8fafc'
  },
  commentLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '8px'
  },
  commentText: {
    margin: 0,
    color: '#0f172a',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap'
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '16px'
  },
  subCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    background: '#f8fafc'
  },
  subCardTitle: {
    margin: '0 0 14px 0',
    fontSize: '16px',
    color: '#0f172a'
  },
  zoneGrid: {
    display: 'grid',
    gap: '12px'
  },
  zoneCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px'
  },
  zoneTitle: {
    display: 'block',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '10px'
  },
  chips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: '13px'
  },
  tireReportGrid: {
    display: 'grid',
    gap: '12px'
  },
  tireReportCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px',
    display: 'grid',
    gap: '10px'
  },
  valuationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px'
  },
  valuationCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    display: 'grid',
    gap: '8px'
  },
  valuationLabel: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b'
  },
  valuationValue: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#0f172a',
    lineHeight: 1.1
  },
  downloadButton: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '11px 16px',
    cursor: 'pointer',
    fontWeight: 700
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px'
  },
  photoCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 8px 20px rgba(15,23,42,0.05)'
  },
  photoPreview: {
    height: '210px',
    background: '#f8fafc'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'zoom-in'
  },
  noPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  photoFooter: {
    padding: '14px',
    display: 'grid',
    gap: '10px'
  },
  photoTag: {
    display: 'inline-flex',
    width: 'fit-content',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#4338ca',
    fontSize: '12px',
    fontWeight: 800
  },
  photoName: {
    fontSize: '13px',
    color: '#0f172a',
    wordBreak: 'break-word',
    fontWeight: 600
  },
  smallButton: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '9px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  emptyText: {
    color: '#64748b',
    margin: 0
  },
  historyList: {
    display: 'grid',
    gap: '12px'
  },
  historyCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '14px 16px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 8px 18px rgba(15,23,42,0.04)'
  },
  historyTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  historyDate: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.02em'
  },
  historyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 800
  },
  historyBody: {
    display: 'grid',
    gap: '6px'
  },
  historyUser: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#334155'
  },
  historyDetailText: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.45
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px',
    backdropFilter: 'blur(6px)'
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '92vw',
    maxHeight: '92vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewLargeImage: {
    maxWidth: '92vw',
    maxHeight: '92vh',
    objectFit: 'contain',
    borderRadius: '14px'
  },
  previewCloseButton: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    border: 'none',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 800
  }
};