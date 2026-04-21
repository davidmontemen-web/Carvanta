export default function AppraisalFormFugasMotorSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  renderTechnicalStatusField,
  renderTextarea,
  updateSectionField
}) {
  const sectionKey = 'fugasMotor';

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
          <h3 style={styles.sectionTitle}>Fugas y motor</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        {renderTechnicalStatusField('Motor', form.fugasMotor.motor, (val) =>
          updateSectionField('fugasMotor', 'motor', val)
        )}

        {renderTechnicalStatusField('Transmisión', form.fugasMotor.transmision, (val) =>
          updateSectionField('fugasMotor', 'transmision', val)
        )}

        {renderTechnicalStatusField('Sistema de frenos', form.fugasMotor.sistemaFrenos, (val) =>
          updateSectionField('fugasMotor', 'sistemaFrenos', val)
        )}

        {renderTechnicalStatusField('Dirección hidráulica', form.fugasMotor.direccionHidraulica, (val) =>
          updateSectionField('fugasMotor', 'direccionHidraulica', val)
        )}

        {renderTechnicalStatusField('Amortiguadores', form.fugasMotor.amortiguadores, (val) =>
          updateSectionField('fugasMotor', 'amortiguadores', val)
        )}

        {renderTechnicalStatusField('Anticongelante', form.fugasMotor.anticongelante, (val) =>
          updateSectionField('fugasMotor', 'anticongelante', val)
        )}

        {renderTechnicalStatusField('Aire acondicionado', form.fugasMotor.aireAcondicionado, (val) =>
          updateSectionField('fugasMotor', 'aireAcondicionado', val)
        )}

        {renderTechnicalStatusField('Flechas', form.fugasMotor.flechas, (val) =>
          updateSectionField('fugasMotor', 'flechas', val)
        )}

        {renderTechnicalStatusField('Soportes de motor', form.fugasMotor.soportesMotor, (val) =>
          updateSectionField('fugasMotor', 'soportesMotor', val)
        )}

        {renderTechnicalStatusField('Soportes de caja', form.fugasMotor.soportesCaja, (val) =>
          updateSectionField('fugasMotor', 'soportesCaja', val)
        )}

        {renderTextarea(
          'Comentarios',
          form.fugasMotor.comentarios,
          (e) => updateSectionField('fugasMotor', 'comentarios', e.target.value),
          'Ej. Ligera fuga en dirección hidráulica y soportes de motor con desgaste visible'
        )}
      </div>
    </section>
  );
}