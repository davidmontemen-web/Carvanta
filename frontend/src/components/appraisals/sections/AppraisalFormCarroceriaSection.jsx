export default function AppraisalFormCarroceriaSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  carroceriaZones,
  renderDamageZone,
  neumaticoPositions,
  renderNeumaticoCard,
  renderTextarea,
  form,
  updateSectionField,
  isReadOnly = false
}) {
  const sectionKey = 'carroceria';

  return (
    <section
      ref={(el) => {
        registerSectionRef(sectionKey, el);
      }}
      style={{
        ...styles.sectionCard,
        ...(activeSection === sectionKey ? styles.sectionCardActive : {})
      }}
    >
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>Carrocería y neumáticos</h3>
          <p style={styles.sectionSubtitle}>
            Deja aquí las observaciones generales del estado exterior y neumáticos.
          </p>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <fieldset style={styles.carroceriaWrapper} disabled={isReadOnly}>
        <div style={styles.subsectionBlock}>
          <h4 style={styles.subsectionTitle}>Carrocería por zonas</h4>
          <p style={styles.helperText}>
            Selecciona uno o varios hallazgos por cada zona del vehículo.
          </p>

          <div style={styles.damageZoneGrid}>
            {carroceriaZones.map((zone) => renderDamageZone(zone.key, zone.label))}
          </div>
        </div>

        <div style={styles.subsectionBlock}>
          <h4 style={styles.subsectionTitle}>Neumáticos y rines</h4>
          <p style={styles.helperText}>
            Para guardar el avalúo completo debes evaluar las 4 posiciones.
          </p>

          <div style={styles.tireGrid}>
            {neumaticoPositions.map((position) =>
              renderNeumaticoCard(position.key, position.label)
            )}
          </div>
        </div>

        {renderTextarea(
          'Comentarios',
          form.carroceria.observaciones,
          (e) => updateSectionField('carroceria', 'observaciones', e.target.value),
          'Ej. Costado izquierdo con abolladura ligera y llanta delantera derecha desgastada',
          isReadOnly
        )}
      </fieldset>
    </section>
  );
}
