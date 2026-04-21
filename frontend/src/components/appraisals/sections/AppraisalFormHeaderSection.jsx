export default function AppraisalFormHeaderSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  toDateInputValue,
  handleClienteChange,
  handleClienteBlur,
  hasValue,
  formatPhoneDisplay,
  formatPhoneDigits,
  handleTelefonoChange,
  handleVehiculoInteresChange
}) {
  const sectionKey = 'encabezado';

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
          <h3 style={styles.sectionTitle}>Encabezado</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        <div style={styles.field}>
          <label style={styles.label}>Folio</label>
          <input
            type="text"
            value={form.folio || ''}
            readOnly
            style={styles.inputReadOnly}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Fecha de avalúo</label>
          <input
            type="date"
            value={toDateInputValue(form.fechaAvaluo)}
            readOnly
            style={styles.inputReadOnly}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Nombre del cliente</label>
          <input
            type="text"
            value={form.clienteNombre || ''}
            onChange={handleClienteChange}
            onBlur={handleClienteBlur}
            placeholder="Nombre del cliente"
            style={{
              ...styles.input,
              ...(!hasValue(form.clienteNombre) ? styles.inputRequired : {})
            }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Teléfono</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatPhoneDisplay(form.clienteTelefono)}
            onChange={handleTelefonoChange}
            placeholder="222 123 4567"
            style={{
              ...styles.input,
              ...(formatPhoneDigits(form.clienteTelefono).length > 0 &&
              formatPhoneDigits(form.clienteTelefono).length !== 10
                ? styles.inputError
                : !hasValue(form.clienteTelefono)
                ? styles.inputRequired
                : {})
            }}
          />
          {formatPhoneDigits(form.clienteTelefono).length > 0 &&
            formatPhoneDigits(form.clienteTelefono).length !== 10 && (
              <span style={styles.helperError}>El teléfono debe tener 10 dígitos.</span>
            )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Vehículo de interés</label>
          <input
            type="text"
            value={form.vehiculoInteres || ''}
            onChange={handleVehiculoInteresChange}
            placeholder="Ej. Mazda CX-5 2020"
            style={{
              ...styles.input,
              ...(!hasValue(form.vehiculoInteres) ? styles.inputRequired : {})
            }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Asesor de ventas</label>
          <input
            type="text"
            value={form.asesorVentas || ''}
            readOnly
            style={styles.inputReadOnly}
          />
        </div>
      </div>
    </section>
  );
}