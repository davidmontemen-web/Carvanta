import { useState } from 'react';
import { downloadAppraisalPhotosZip } from '../../services/appraisalPhotoService';

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

async function downloadPhotoGroup(photos, prefix) {
  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    await downloadPhoto(photo, `${prefix}_${index + 1}.jpg`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

export default function AppraisalDetailModal({ abierto, appraisal, onClose }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!abierto || !appraisal) return null;

  const generalPhotos = Array.isArray(appraisal.fotosGenerales)
    ? appraisal.fotosGenerales
    : [];

  const detailPhotos = Array.isArray(appraisal.fotosDetalle)
    ? appraisal.fotosDetalle
    : [];

  const visibleGeneralPhotos = generalPhotos.slice(0, 6);
  const visibleDetailPhotos = detailPhotos.slice(0, 6);

  async function downloadZip(appraisalId, photoType) {
  try {
    const blob = await downloadAppraisalPhotosZip({ appraisalId, photoType });
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

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Detalle del avalúo</h2>
              <p style={styles.subtitle}>{appraisal.folio}</p>
            </div>

            <button style={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={styles.body}>
            <div style={styles.section}>
              <h3>Encabezado</h3>
              <div style={styles.grid}>
                <p><strong>Cliente:</strong> {appraisal.clienteNombre || '-'}</p>
                <p><strong>Teléfono:</strong> {appraisal.clienteTelefono || '-'}</p>
                <p><strong>Vehículo interés:</strong> {appraisal.vehiculoInteres || '-'}</p>
                <p><strong>Fecha avalúo:</strong> {appraisal.fechaAvaluo || '-'}</p>
                <p><strong>Asesor:</strong> {appraisal.asesorVentas || '-'}</p>
                <p><strong>Estatus:</strong> {appraisal.estatus || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Generales del vehículo</h3>
              <div style={styles.grid}>
                <p><strong>Marca:</strong> {appraisal.generales?.marca || '-'}</p>
                <p><strong>Sub marca:</strong> {appraisal.generales?.subMarca || '-'}</p>
                <p><strong>Versión:</strong> {appraisal.generales?.version || '-'}</p>
                <p><strong>Año modelo:</strong> {appraisal.generales?.anioModelo || '-'}</p>
                <p><strong>Color:</strong> {appraisal.generales?.color || '-'}</p>
                <p><strong>Kilometraje:</strong> {appraisal.generales?.kilometraje || '-'}</p>
                <p><strong>Transmisión:</strong> {appraisal.generales?.transmision || '-'}</p>
                <p><strong>No. de serie:</strong> {appraisal.generales?.numeroSerie || '-'}</p>
                <p><strong>No. dueños:</strong> {appraisal.generales?.numeroDuenios || '-'}</p>
                <p><strong>Placas:</strong> {appraisal.generales?.placas || '-'}</p>
                <p><strong>Complementarios:</strong> {appraisal.generales?.complementarios || '-'}</p>
                <p><strong>Comentarios:</strong> {appraisal.generales?.comentarios || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Documentación</h3>
              <div style={styles.grid}>
                <p><strong>Factura:</strong> {appraisal.documentacion?.factura || '-'}</p>
                <p><strong>C. de origen:</strong> {appraisal.documentacion?.cartaOrigen || '-'}</p>
                <p><strong>Tenencias:</strong> {appraisal.documentacion?.tenencias || '-'}</p>
                <p><strong>Últ. servicio:</strong> {appraisal.documentacion?.ultimoServicio || '-'}</p>
                <p><strong>Verificación:</strong> {appraisal.documentacion?.verificacion || '-'}</p>
                <p><strong>Manuales:</strong> {appraisal.documentacion?.manuales || '-'}</p>
                <p><strong>Garantía:</strong> {appraisal.documentacion?.garantia || '-'}</p>
                <p><strong>Engomado:</strong> {appraisal.documentacion?.engomado || '-'}</p>
                <p><strong>Tarjeta circ.:</strong> {appraisal.documentacion?.tarjetaCirculacion || '-'}</p>
                <p><strong>Póliza seguro:</strong> {appraisal.documentacion?.polizaSeguro || '-'}</p>
                <p><strong>Comentarios:</strong> {appraisal.documentacion?.comentarios || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Aspecto físico interior</h3>
              <div style={styles.grid}>
                <p><strong>Vestiduras:</strong> {appraisal.interior?.vestiduras || '-'}</p>
                <p><strong>Cielo:</strong> {appraisal.interior?.cielo || '-'}</p>
                <p><strong>Consola:</strong> {appraisal.interior?.consola || '-'}</p>
                <p><strong>Alfombras:</strong> {appraisal.interior?.alfombras || '-'}</p>
                <p><strong>Tablero:</strong> {appraisal.interior?.tablero || '-'}</p>
                <p><strong>Encendedor:</strong> {appraisal.interior?.encendedor || '-'}</p>
                <p><strong>Puertas:</strong> {appraisal.interior?.puertas || '-'}</p>
                <p><strong>Volante:</strong> {appraisal.interior?.volante || '-'}</p>
                <p><strong>Consola 2:</strong> {appraisal.interior?.consolaDos || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Carrocería y neumáticos</h3>
              <p><strong>Observaciones:</strong> {appraisal.carroceria?.observaciones || '-'}</p>
            </div>

            <div style={styles.section}>
              <h3>Sistema eléctrico</h3>
              <div style={styles.grid}>
                {Object.entries(appraisal.sistemaElectrico || {}).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {value ? 'Sí' : 'No'}
                  </p>
                ))}
              </div>
            </div>

            <div style={styles.section}>
              <h3>Fugas y motor</h3>
              <div style={styles.grid}>
                <p><strong>Motor:</strong> {appraisal.fugasMotor?.motor || '-'}</p>
                <p><strong>Transmisión:</strong> {appraisal.fugasMotor?.transmision || '-'}</p>
                <p><strong>Sistema de frenos:</strong> {appraisal.fugasMotor?.sistemaFrenos || '-'}</p>
                <p><strong>Dir. hidráulica:</strong> {appraisal.fugasMotor?.direccionHidraulica || '-'}</p>
                <p><strong>Amortiguadores:</strong> {appraisal.fugasMotor?.amortiguadores || '-'}</p>
                <p><strong>Anticongelante:</strong> {appraisal.fugasMotor?.anticongelante || '-'}</p>
                <p><strong>Aire acondicionado:</strong> {appraisal.fugasMotor?.aireAcondicionado || '-'}</p>
                <p><strong>Flechas:</strong> {appraisal.fugasMotor?.flechas || '-'}</p>
                <p><strong>Soportes de motor:</strong> {appraisal.fugasMotor?.soportesMotor || '-'}</p>
                <p><strong>Soportes caja:</strong> {appraisal.fugasMotor?.soportesCaja || '-'}</p>
                <p><strong>Comentarios:</strong> {appraisal.fugasMotor?.comentarios || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Valuación</h3>
              <div style={styles.grid}>
                <p><strong>Toma libro:</strong> {appraisal.valuacion?.tomaLibro || '-'}</p>
                <p><strong>Venta libro:</strong> {appraisal.valuacion?.ventaLibro || '-'}</p>
                <p><strong>Reparaciones:</strong> {appraisal.valuacion?.reparaciones || '-'}</p>
                <p><strong>Toma autorizada:</strong> {appraisal.valuacion?.tomaAutorizada || '-'}</p>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.photoSectionHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>Fotos generales</h3>
                  <p style={styles.photoSectionSubtitle}>
                    Vista previa de fotos principales del expediente
                  </p>
                </div>
                <button
  style={styles.downloadButton}
  onClick={() => downloadZip(appraisal.id, 'general')}
  disabled={!generalPhotos.length}
>
  Descargar generales ZIP
</button>
              </div>

              {visibleGeneralPhotos.length ? (
                <div style={styles.photoGrid}>
                  {visibleGeneralPhotos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} style={styles.photoCard}>
                      <div style={styles.photoPreview}>
                        {(photo.url || photo.preview) ? (
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
                        <span style={styles.photoName}>
                          {photo.name || `General ${index + 1}`}
                        </span>
                        {(photo.url || photo.preview) && (
                          <button
                            style={styles.smallButton}
                            onClick={() => downloadPhoto(photo, photo.name)}
                          >
                            Descargar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay fotos generales.</p>
              )}
            </div>

            <div style={styles.section}>
              <div style={styles.photoSectionHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>Fotos de detalle</h3>
                  <p style={styles.photoSectionSubtitle}>
                    Vista previa de daños, piezas o evidencia adicional
                  </p>
                </div>
                <button
  style={styles.downloadButton}
  onClick={() => downloadZip(appraisal.id, 'detail')}
  disabled={!detailPhotos.length}
>
  Descargar detalle ZIP
</button>
              </div>

              {visibleDetailPhotos.length ? (
                <div style={styles.photoGrid}>
                  {visibleDetailPhotos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} style={styles.photoCard}>
                      <div style={styles.photoPreview}>
                        {(photo.url || photo.preview) ? (
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
                        <span style={styles.photoName}>
                          {photo.name || `Detalle ${index + 1}`}
                        </span>
                        {(photo.url || photo.preview) && (
                          <button
                            style={styles.smallButton}
                            onClick={() => downloadPhoto(photo, photo.name)}
                          >
                            Descargar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay fotos de detalle.</p>
              )}
            </div>

            <div style={styles.section}>
              <h3>Historial</h3>
              {appraisal.historial?.length ? (
                <ul style={styles.list}>
                  {appraisal.historial.map((item, idx) => (
                    <li key={`${item.fecha}-${idx}`}>
                      <strong>{item.fecha}:</strong> {item.accion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin historial.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewImage && (
        <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
          <div style={styles.previewContainer} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.previewCloseButton}
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
            <img src={previewImage} alt="preview" style={styles.previewLargeImage} />
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 2000
  },
  modal: {
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'auto',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.18)'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: '#6b7280'
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '22px',
    cursor: 'pointer'
  },
  body: {
    padding: '24px',
    display: 'grid',
    gap: '18px'
  },
  section: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  list: {
    margin: 0,
    paddingLeft: '18px'
  },
  photoSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  photoSectionSubtitle: {
    margin: '6px 0 0 0',
    color: '#6b7280',
    fontSize: '14px'
  },
  downloadButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 600
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px'
  },
  photoCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#fff'
  },
  photoPreview: {
    height: '180px',
    background: '#f8fafc'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer'
  },
  noPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  },
  photoFooter: {
    padding: '12px',
    display: 'grid',
    gap: '10px'
  },
  photoName: {
    fontSize: '13px',
    color: '#111827',
    wordBreak: 'break-word'
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
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px'
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewLargeImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: '12px'
  },
  previewCloseButton: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    border: 'none',
    background: '#fff',
    color: '#111827',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 700
  }
};