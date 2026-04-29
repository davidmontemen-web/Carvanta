import { useEffect, useMemo, useState } from 'react';
import { downloadAppraisalPhotosZip } from '../../services/appraisalPhotoService';
import {
  getAppraisalHistory,
  downloadAppraisalPdf,
  updateAppraisal
} from '../../services/appraisalService';
import {
  sectionTitles,
  tirePositionLabels,
  generalPhotoOrder,
  generalPhotoLabels,
  downloadPhoto,
  formatMoney,
  formatDate,
  formatHistoryDateTime,
  toDisplayValue,
  formatYesNoNa,
  formatTechnical,
  formatDamage,
  formatTireState,
  formatHistoryAction,
  getHistoryAccent
} from './AppraisalDetailModal.helpers';
import AppraisalDetailHeader from './AppraisalDetailHeader';
import AppraisalDetailPhotosSection from './AppraisalDetailPhotosSection';
import AppraisalDetailHistorySection from './AppraisalDetailHistorySection';
import { styles } from './AppraisalDetailModal.styles';



const renderStatusBadge = (status) => {
  const map = {
  borrador: styles.badgeDraft,
  completo: styles.badgeSuccess,
  comprado: styles.badgeWarning
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

export default function AppraisalDetailModal({ abierto, appraisal, onClose, onSaved }) {
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

async function handleConfirmPurchase() {
  try {
    if (!appraisal?.id) {
      throw new Error('No hay avalúo disponible');
    }

    const confirmed = window.confirm(
      `¿Estás seguro de pasar esta unidad a inventario?\n\nFolio: ${appraisal.folio || appraisal.id}\nVehículo: ${appraisal.generales?.marca || ''} ${appraisal.generales?.submarca || ''} ${appraisal.generales?.version || ''}\n\nEsta acción confirmará la compra del vehículo.`
    );

    if (!confirmed) return;

    const payload = {
  ...appraisal,
  fechaAvaluo: appraisal?.fechaAvaluo
    ? String(appraisal.fechaAvaluo).slice(0, 10)
    : '',
  estatus: 'comprado'
};

    const response = await updateAppraisal(appraisal.id, payload);

    if (!response?.ok) {
      throw new Error('No se pudo actualizar el avalúo');
    }

    alert('Unidad enviada a inventario correctamente.');

    if (typeof onSaved === 'function') {
      await onSaved();
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  } catch (error) {
    console.error('Error al confirmar compra:', error);
    alert(error?.message || 'No se pudo confirmar la compra.');
  }
}



  const carroceriaZonas = appraisal.carroceria?.zonas || {};
  const carroceriaNeumaticos = appraisal.carroceria?.neumaticos || {};

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <AppraisalDetailHeader
  appraisal={appraisal}
  onClose={onClose}
  onDownloadPdf={handleDownloadPdf}
  onConfirmPurchase={handleConfirmPurchase}
  renderStatusBadge={renderStatusBadge}
  styles={styles}
/>

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

            <SectionCard title="Validación gerencial" subtitle="Control de autorización final del avalúo.">
              <div style={styles.summaryGrid}>
                <DetailItem
                  label="Validado por"
                  value={toDisplayValue(appraisal.validacionGerente?.validadoPor)}
                />
                <DetailItem
                  label="Fecha validación"
                  value={formatDate(appraisal.validacionGerente?.validadoAt)}
                />
              </div>
              <div style={styles.commentBox}>
                <span style={styles.commentLabel}>Observaciones de gerencia</span>
                <p style={styles.commentText}>
                  {toDisplayValue(appraisal.validacionGerente?.observaciones)}
                </p>
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

            <AppraisalDetailPhotosSection
  appraisal={appraisal}
  styles={styles}
  generalPhotos={generalPhotos}
  detailPhotos={detailPhotos}
  generalPhotoLabels={generalPhotoLabels}
  onDownloadZip={downloadZip}
  onOpenPreview={setPreviewImage}
  onDownloadPhoto={downloadPhoto}
/>

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

<AppraisalDetailHistorySection
  styles={styles}
  historyLoading={historyLoading}
  history={history}
  formatHistoryDateTime={formatHistoryDateTime}
  formatHistoryAction={formatHistoryAction}
  getHistoryAccent={getHistoryAccent}
  toDisplayValue={toDisplayValue}

/>

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
