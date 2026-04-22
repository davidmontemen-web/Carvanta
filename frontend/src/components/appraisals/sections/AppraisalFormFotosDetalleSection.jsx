export default function AppraisalFormFotosDetalleSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  detailInputRef,
  handleAddDetailPhotos,
  ensureHeaderBeforeUpload,
  isBusy,
  form,
  removeDetailPhoto
}) {
  const sectionKey = 'fotosDetalle';

  return (
    <section
      ref={(el) => registerSectionRef(sectionKey, el)}
      style={{
        ...styles.sectionCard,
        ...(activeSection === sectionKey ? styles.sectionCardActive : {})
      }}
    >
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>Fotos de detalle</h3>
          <p style={styles.sectionSubtitle}>
            Agrega evidencias adicionales, daños, interiores, motor o cualquier hallazgo relevante.
          </p>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

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
    </section>
  );
}