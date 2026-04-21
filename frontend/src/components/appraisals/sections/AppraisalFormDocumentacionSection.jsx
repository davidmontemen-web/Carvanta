export default function AppraisalFormDocumentacionSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  renderYesNoField,
  renderTextarea,
  updateSectionField
}) {
  const sectionKey = 'documentacion';

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
          <h3 style={styles.sectionTitle}>Documentación</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        {renderYesNoField('Factura', form.documentacion.factura, (val) =>
          updateSectionField('documentacion', 'factura', val)
        )}

        {renderYesNoField('Carta origen', form.documentacion.cartaOrigen, (val) =>
          updateSectionField('documentacion', 'cartaOrigen', val)
        )}

        {renderYesNoField('Tenencias', form.documentacion.tenencias, (val) =>
          updateSectionField('documentacion', 'tenencias', val)
        )}

        {renderYesNoField('Último servicio', form.documentacion.ultimoServicio, (val) =>
          updateSectionField('documentacion', 'ultimoServicio', val)
        )}

        {renderYesNoField('Verificación', form.documentacion.verificacion, (val) =>
          updateSectionField('documentacion', 'verificacion', val)
        )}

        {renderYesNoField('Manuales', form.documentacion.manuales, (val) =>
          updateSectionField('documentacion', 'manuales', val)
        )}

        {renderYesNoField('Garantía', form.documentacion.garantia, (val) =>
          updateSectionField('documentacion', 'garantia', val)
        )}

        {renderYesNoField('Engomado', form.documentacion.engomado, (val) =>
          updateSectionField('documentacion', 'engomado', val)
        )}

        {renderYesNoField('Tarjeta de circulación', form.documentacion.tarjetaCirculacion, (val) =>
          updateSectionField('documentacion', 'tarjetaCirculacion', val)
        )}

        {renderYesNoField('Póliza de seguro', form.documentacion.polizaSeguro, (val) =>
          updateSectionField('documentacion', 'polizaSeguro', val)
        )}

        {renderTextarea(
          'Comentarios',
          form.documentacion.comentarios,
          (e) => updateSectionField('documentacion', 'comentarios', e.target.value),
          'Ej. Factura original, falta endoso'
        )}
      </div>
    </section>
  );
}