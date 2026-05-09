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
    frontal: 'Frente del vehículo',
    frontalDerecha: 'Frente 3/4 derecha',
    lateralDerecha: 'Costado derecho',
    traseraDerecha: 'Trasera 3/4 derecha',
    trasera: 'Parte trasera',
    traseraIzquierda: 'Trasera 3/4 izquierda',
    lateralIzquierda: 'Costado izquierdo',
    frontalIzquierda: 'Frente 3/4 izquierda',
    interiorTablero: 'Tablero interior',
    motor: 'Bahía del motor'
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
                    <div style={styles.silhouetteCar}>🚗</div>
                    <div style={styles.silhouetteText}>Referencia: {slotReferenceMap[slot.key] || slot.label}</div>
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
