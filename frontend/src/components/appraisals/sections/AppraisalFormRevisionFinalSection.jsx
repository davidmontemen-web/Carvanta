export default function AppraisalFormRevisionFinalSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  validation
}) {
  const sectionKey = 'revisionFinal';

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
          <h3 style={styles.sectionTitle}>Revisión final</h3>
          <p style={styles.sectionSubtitle}>
            Antes de guardar el avalúo, valida que todo lo esencial esté listo.
          </p>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.validationGrid}>
        <div style={styles.validationItem}>
          <strong>Encabezado</strong>
          <span
            style={{
              ...styles.statusPill,
              ...(validation.requiredHeader ? styles.statusOk : styles.statusPending)
            }}
          >
            {validation.requiredHeader ? 'Listo' : 'Incompleto'}
          </span>
        </div>

        <div style={styles.validationItem}>
          <strong>Generales del vehículo</strong>
          <span
            style={{
              ...styles.statusPill,
              ...(validation.requiredGenerales ? styles.statusOk : styles.statusPending)
            }}
          >
            {validation.requiredGenerales ? 'Listo' : 'Incompleto'}
          </span>
        </div>

        <div style={styles.validationItem}>
          <strong>Valuación</strong>
          <span
            style={{
              ...styles.statusPill,
              ...(validation.requiredValuacion ? styles.statusOk : styles.statusPending)
            }}
          >
            {validation.requiredValuacion ? 'Listo' : 'Incompleto'}
          </span>
        </div>

        <div style={styles.validationItem}>
          <strong>Fotos requeridas</strong>
          <span
            style={{
              ...styles.statusPill,
              ...(validation.requiredPhotos ? styles.statusOk : styles.statusPending)
            }}
          >
            {validation.requiredPhotos ? 'Listo' : 'Incompleto'}
          </span>
        </div>
      </div>
    </section>
  );
}