export default function AppraisalFormGeneralesSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  renderField,
  renderTextarea,
  handleGeneralTitle,
  handleGeneralTextChange,
  handleAnioChange,
  updateSectionField,
  handleKilometrajeChange,
  handleGeneralUppercase
}) {
  const sectionKey = 'generales';

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
          <h3 style={styles.sectionTitle}>Generales del vehículo</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        {renderField(
          'Marca',
          form.generales.marca,
          (e) => handleGeneralTitle('marca', e.target.value),
          'text',
          'Ej. Mazda'
        )}

        {renderField(
          'Submarca',
          form.generales.submarca,
          (e) => handleGeneralTitle('submarca', e.target.value),
          'text',
          'Ej. CX-5'
        )}

        {renderField(
          'Versión',
          form.generales.version,
          (e) => handleGeneralTextChange('version', e.target.value),
          'text',
          'Ej. i Grand Touring'
        )}

        {renderField(
          'Año modelo',
          form.generales.anio,
          (e) => handleAnioChange(e.target.value),
          'text',
          'Ej. 2020'
        )}

        <div style={styles.field}>
          <label style={styles.label}>Transmisión</label>
          <select
            value={form.generales.transmision || ''}
            onChange={(e) => updateSectionField('generales', 'transmision', e.target.value)}
            style={styles.input}
          >
            <option value="">Selecciona</option>
            <option value="Automática">Automática</option>
            <option value="Manual">Manual</option>
            <option value="CVT">CVT</option>
            <option value="No especificado">No especificado</option>
          </select>
        </div>

        {renderField(
          'Color',
          form.generales.color,
          (e) => handleGeneralTitle('color', e.target.value),
          'text',
          'Ej. Blanco perla'
        )}

        {renderField(
          'Kilometraje',
          form.generales.kilometraje,
          (e) => handleKilometrajeChange(e.target.value),
          'text',
          'Ej. 87000'
        )}

        <div style={styles.field}>
          <label style={styles.label}>Número de dueños</label>
          <select
            value={form.generales.numeroDuenos || ''}
            onChange={(e) => updateSectionField('generales', 'numeroDuenos', e.target.value)}
            style={styles.input}
          >
            <option value="">Selecciona</option>
            <option value="Único dueño">Único dueño</option>
            <option value="2 dueños">2 dueños</option>
            <option value="3 dueños">3 dueños</option>
            <option value="4+ dueños">4+ dueños</option>
            <option value="No sabe">No sabe</option>
          </select>
        </div>

        {renderField(
          'Número de serie',
          form.generales.numeroSerie,
          (e) => handleGeneralUppercase('numeroSerie', e.target.value),
          'text',
          'VIN'
        )}

        {renderField(
          'Placas',
          form.generales.placas,
          (e) => handleGeneralUppercase('placas', e.target.value),
          'text',
          'Ej. ABC1234'
        )}

        {renderTextarea(
          'Comentarios',
          form.generales.comentarios,
          (e) => handleGeneralTextChange('comentarios', e.target.value),
          'Ej. Vehículo con desgaste normal de uso y detalle ligero en fascia delantera'
        )}
      </div>
    </section>
  );
}