export default function AppraisalFormInteriorSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  renderConditionField,
  renderTextarea,
  updateSectionField
}) {
  const sectionKey = 'interior';

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
          <h3 style={styles.sectionTitle}>Aspecto físico interior</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        {renderConditionField('Vestiduras', form.interior.vestiduras, (val) =>
          updateSectionField('interior', 'vestiduras', val)
        )}

        {renderConditionField('Cielo', form.interior.cielo, (val) =>
          updateSectionField('interior', 'cielo', val)
        )}

        {renderConditionField('Consola central', form.interior.consolaCentral, (val) =>
          updateSectionField('interior', 'consolaCentral', val)
        )}

        {renderConditionField('Alfombras', form.interior.alfombras, (val) =>
          updateSectionField('interior', 'alfombras', val)
        )}

        {renderConditionField('Tablero', form.interior.tablero, (val) =>
          updateSectionField('interior', 'tablero', val)
        )}

        {renderConditionField('Encendedor / toma corriente', form.interior.encendedor, (val) =>
          updateSectionField('interior', 'encendedor', val)
        )}

        {renderConditionField('Puertas / vestiduras laterales', form.interior.puertasLaterales, (val) =>
          updateSectionField('interior', 'puertasLaterales', val)
        )}

        {renderConditionField('Volante', form.interior.volante, (val) =>
          updateSectionField('interior', 'volante', val)
        )}

        {renderTextarea(
          'Comentarios',
          form.interior.comentarios,
          (e) => updateSectionField('interior', 'comentarios', e.target.value),
          'Ej. Vestiduras con desgaste ligero en asiento del conductor y detalle menor en tablero'
        )}
      </div>
    </section>
  );
}