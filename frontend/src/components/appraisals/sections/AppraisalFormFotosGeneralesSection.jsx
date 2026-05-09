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
  const slotViewMap = {
    frontal: 'front',
    frontalDerecha: 'quarterRight',
    lateralDerecha: 'sideRight',
    traseraDerecha: 'quarterRearRight',
    trasera: 'rear',
    traseraIzquierda: 'quarterRearLeft',
    lateralIzquierda: 'sideLeft',
    frontalIzquierda: 'quarterLeft',
    interiorTablero: 'interior',
    motor: 'engine'
  };

  const renderSilhouetteByView = (view) => {
    if (view === 'front' || view === 'rear') {
      return (
        <svg viewBox="0 0 160 92" style={styles.silhouetteSvg} aria-hidden="true">
          <path d="M28 60 L38 38 C40 32 46 28 53 28 H107 C114 28 120 32 122 38 L132 60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <rect x="24" y="56" width="112" height="22" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="46" cy="70" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="114" cy="70" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="64" y1="41" x2="96" y2="41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }
    if (view === 'interior') {
      return (
        <svg viewBox="0 0 160 92" style={styles.silhouetteSvg} aria-hidden="true">
          <rect x="24" y="18" width="112" height="56" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="80" cy="44" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
          <line x1="80" y1="30" x2="80" y2="58" stroke="currentColor" strokeWidth="3" />
          <line x1="66" y1="44" x2="94" y2="44" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    }
    if (view === 'engine') {
      return (
        <svg viewBox="0 0 160 92" style={styles.silhouetteSvg} aria-hidden="true">
          <rect x="34" y="24" width="92" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="56" y="36" width="48" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="46" y1="24" x2="46" y2="14" stroke="currentColor" strokeWidth="3" />
          <line x1="114" y1="24" x2="114" y2="14" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    }

    const transformMap = {
      sideLeft: 'scale(1,1)',
      sideRight: 'scale(-1,1) translate(-180,0)',
      quarterLeft: 'scale(1,1)',
      quarterRight: 'scale(-1,1) translate(-180,0)',
      quarterRearLeft: 'scale(-1,1) translate(-180,0)',
      quarterRearRight: 'scale(1,1)'
    };
    const transform = transformMap[view] || 'scale(1,1)';

    return (
      <svg viewBox="0 0 180 92" style={styles.silhouetteSvg} aria-hidden="true">
        <g transform={transform}>
          <path d="M10 58 C26 42, 48 38, 74 38 L92 38 C103 38, 112 34, 122 26 C132 19, 147 16, 162 24 C169 28, 174 34, 176 40 L176 62 C176 67, 172 71, 166 71 L18 71 C13 71, 9 67, 9 62 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="51" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="138" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M82 38 L118 38 C128 38, 137 34, 144 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    );
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
                    {renderSilhouetteByView(slotViewMap[slot.key])}
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
