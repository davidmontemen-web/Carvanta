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
                    <svg viewBox="0 0 180 92" style={styles.silhouetteSvg} aria-hidden="true">
                      <path
                        d="M10 58 C26 42, 48 38, 74 38 L92 38 C103 38, 112 34, 122 26 C132 19, 147 16, 162 24 C169 28, 174 34, 176 40 L176 62 C176 67, 172 71, 166 71 L18 71 C13 71, 9 67, 9 62 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="51" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
                      <circle cx="138" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path d="M82 38 L118 38 C128 38, 137 34, 144 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      <path d="M30 52 L48 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      <path d="M164 49 L176 49" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
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
