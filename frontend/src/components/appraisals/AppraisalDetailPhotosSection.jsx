function LocalSectionCard({ title, subtitle, right, styles, children }) {
  return (
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
}

export default function AppraisalDetailPhotosSection({
  appraisal,
  styles,
  generalPhotos,
  detailPhotos,
  generalPhotoLabels,
  onDownloadZip,
  onOpenPreview,
  onDownloadPhoto
}) {
  return (
    <>
      <LocalSectionCard
        title="Fotos generales"
        subtitle="Vista previa de imágenes principales del expediente."
        styles={styles}
        right={
          <button
            style={styles.downloadButton}
            onClick={() => onDownloadZip(appraisal.id, 'general')}
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
                      onClick={() => onOpenPreview(photo.url || photo.preview)}
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
                      onClick={() => onDownloadPhoto(photo, photo.name)}
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
      </LocalSectionCard>

      <LocalSectionCard
        title="Fotos de detalle"
        subtitle="Daños, piezas o evidencia adicional del avalúo."
        styles={styles}
        right={
          <button
            style={styles.downloadButton}
            onClick={() => onDownloadZip(appraisal.id, 'detail')}
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
                      onClick={() => onOpenPreview(photo.url || photo.preview)}
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
                      onClick={() => onDownloadPhoto(photo, photo.name)}
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
      </LocalSectionCard>
    </>
  );
}