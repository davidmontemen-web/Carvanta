export default function AppraisalFormValuacionSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  formatMoneyDisplay,
  handleValuacionNumberChange,
  renderTextarea
}) {
  const sectionKey = 'valuacion';

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
          <h3 style={styles.sectionTitle}>Valuación</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        <div style={styles.field}>
          <label style={styles.label}>Toma libro</label>
          <input
            type="text"
            value={formatMoneyDisplay(form.valuacion.tomaLibro)}
            onChange={(e) => handleValuacionNumberChange('tomaLibro', e.target.value)}
            placeholder="Ej. 180000"
            style={styles.input}
            inputMode="numeric"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Venta libro</label>
          <input
            type="text"
            value={formatMoneyDisplay(form.valuacion.ventaLibro)}
            onChange={(e) => handleValuacionNumberChange('ventaLibro', e.target.value)}
            placeholder="Ej. 220000"
            style={styles.input}
            inputMode="numeric"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Media</label>
          <input
            type="text"
            value={formatMoneyDisplay(form.valuacion.media)}
            readOnly
            style={styles.inputReadOnly}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Reparaciones</label>
          <input
            type="text"
            value={formatMoneyDisplay(form.valuacion.reparaciones)}
            onChange={(e) => handleValuacionNumberChange('reparaciones', e.target.value)}
            placeholder="Ej. 15000"
            style={styles.input}
            inputMode="numeric"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Toma autorizada</label>
          <input
            type="text"
            value={formatMoneyDisplay(form.valuacion.tomaAutorizada)}
            onChange={(e) => handleValuacionNumberChange('tomaAutorizada', e.target.value)}
            placeholder="Ej. 190000"
            style={styles.input}
            inputMode="numeric"
          />
        </div>

        {renderTextarea(
          'Comentarios',
          form.valuacion.comentarios,
          (e) => handleValuacionNumberChange('comentarios', e.target.value, true),
          'Ej. Se ajusta valor por detalle en carrocería y condición de neumáticos'
        )}
      </div>
    </section>
  );
}