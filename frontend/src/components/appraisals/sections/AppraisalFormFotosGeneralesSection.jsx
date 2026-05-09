export default function AppraisalFormFotosGeneralesSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  validation,
  generalPhotoSlots,
  form,
  generalInputRefs,
  handleGeneralPhotoChange,
  handleGeneralPhotoClick,
  isBusy,
  removeGeneralPhoto,
  isReadOnly = false
}) {
  const sectionKey = 'fotosGenerales';
  const slotReferenceMap = {
    frontal: { label: 'Frente del vehículo', cue: 'FRONTAL' },
    frontalDerecha: { label: 'Frente 3/4 derecha', cue: '3/4 DER' },
    lateralDerecha: { label: 'Costado derecho', cue: 'LATERAL DER' },
    traseraDerecha: { label: 'Trasera 3/4 derecha', cue: 'TRASERA 3/4 DER' },
    trasera: { label: 'Parte trasera', cue: 'TRASERA' },
    traseraIzquierda: { label: 'Trasera 3/4 izquierda', cue: 'TRASERA 3/4 IZQ' },
    lateralIzquierda: { label: 'Costado izquierdo', cue: 'LATERAL IZQ' },
    frontalIzquierda: { label: 'Frente 3/4 izquierda', cue: '3/4 IZQ' },
    interiorTablero: { label: 'Tablero interior', cue: 'INTERIOR' },
    motor: { label: 'Bahía del motor', cue: 'MOTOR' }
  };
  const renderFrontSilhouette = () => (
    <svg viewBox="0 0 260 95" style={styles.silhouetteSvg} aria-hidden="true">
      <path
        d="M12 64 C22 49, 50 39, 86 38 C111 37, 129 32, 148 24 C176 12, 212 12, 244 28 L252 32 L236 36 C224 39, 218 44, 208 52 C199 59, 186 63, 164 64 L32 64 C24 64, 17 64, 12 64 Z"
        fill="currentColor"
      />
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
          <h3 style={styles.sectionTitle}>Fotos generales</h3>
          <p style={styles.sectionSubtitle}>
            Captura o reemplaza cada una de las tomas requeridas.
          </p>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

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
                disabled={isReadOnly}
              />

              <div
                style={styles.generalPhotoPreview}
                onClick={() => !isReadOnly && handleGeneralPhotoClick(slot.key)}
              >
                {photo?.preview ? (
                  <img src={photo.preview} alt={slot.label} style={styles.previewImage} />
                ) : (
                  <div style={styles.silhouetteBox}>
                    <div style={styles.silhouetteCue}>
                      {slotReferenceMap[slot.key]?.cue || slot.label.toUpperCase()}
                    </div>
                    {renderFrontSilhouette()}
                    <div style={styles.silhouetteText}>Referencia: {slotReferenceMap[slot.key]?.label || slot.label}</div>
                    <div style={styles.silhouetteHint}>Toca para capturar</div>
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
                    disabled={isBusy || isReadOnly}
                  >
                    {photo ? 'Reemplazar' : 'Capturar'}
                  </button>

                  {photo && (
                    <button
                      type="button"
                      style={styles.smallDangerButton}
                      onClick={() => removeGeneralPhoto(slot.key)}
                      disabled={isBusy || isReadOnly}
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
    </section>
  );
}
