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
    <svg viewBox="0 0 180 92" style={styles.silhouetteSvg} aria-hidden="true">
      <path d="M34 62 L44 38 C47 31 55 26 63 26 H117 C125 26 133 31 136 38 L146 62" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <rect x="30" y="58" width="120" height="22" rx="9" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="56" y="38" width="68" height="14" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="53" cy="69" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="127" cy="69" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="82" y1="44" x2="98" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
