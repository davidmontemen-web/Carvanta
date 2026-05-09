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
  removeDetailPhoto,
  isReadOnly = false
}) {
  const sectionKey = 'fotosDetalle';
  const renderUnifiedSilhouette = () => (
    <svg viewBox="0 0 260 95" style={styles.silhouetteSvg} aria-hidden="true">
      <path d="M12 64 C22 49, 50 39, 86 38 C111 37, 129 32, 148 24 C176 12, 212 12, 244 28 L252 32 L236 36 C224 39, 218 44, 208 52 C199 59, 186 63, 164 64 L32 64 C24 64, 17 64, 12 64 Z" fill="currentColor" />
      <path d="M44 66 C49 51, 62 41, 79 40 C95 40, 107 49, 112 66" fill="#f8fafc" />
      <path d="M176 66 C181 51, 194 41, 211 40 C227 40, 239 49, 244 66" fill="#f8fafc" />
      <path d="M57 66 C61 55, 69 48, 79 48 C89 48, 97 55, 101 66" fill="currentColor" />
      <path d="M189 66 C193 55, 201 48, 211 48 C221 48, 229 55, 233 66" fill="currentColor" />
      <path d="M92 40 C116 30, 137 24, 160 23 C180 22, 198 25, 214 32 L193 35 C183 38, 174 45, 167 52 L102 52 L92 40 Z" fill="#f8fafc" />
      <path d="M105 54 L172 54 C184 54, 193 52, 202 48 L214 45 L200 58 L100 58 Z" fill="currentColor" />
    </svg>
  );

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
        disabled={isReadOnly}
      />

      <button
        type="button"
        style={styles.primaryButton}
        onClick={() => {
          if (!ensureHeaderBeforeUpload()) return;
          detailInputRef.current?.click();
        }}
        disabled={isBusy || isReadOnly}
      >
        + Agregar fotos de detalle
      </button>

      <div style={styles.detailPhotoGrid}>
        {form.fotosDetalle.length === 0 ? (
          <div style={styles.emptyPhotoBox}>
            {renderUnifiedSilhouette()}
            <div style={styles.silhouetteHint}>No hay fotos de detalle aún.</div>
          </div>
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
                  disabled={isBusy || isReadOnly}
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
