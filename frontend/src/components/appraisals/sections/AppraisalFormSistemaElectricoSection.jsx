export default function AppraisalFormSistemaElectricoSection({
  activeSection,
  registerSectionRef,
  renderSectionStatus,
  styles,
  form,
  renderYesNoNAField,
  renderTextarea,
  updateSectionField
}) {
  const sectionKey = 'sistemaElectrico';

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
          <h3 style={styles.sectionTitle}>Sistema eléctrico</h3>
        </div>
        {renderSectionStatus(sectionKey)}
      </div>

      <div style={styles.grid2}>
        {renderYesNoNAField('Espejos eléctricos', form.sistemaElectrico.espejosElectricos, (val) =>
          updateSectionField('sistemaElectrico', 'espejosElectricos', val)
        )}
        {renderYesNoNAField('Bolsas de aire', form.sistemaElectrico.bolsasAire, (val) =>
          updateSectionField('sistemaElectrico', 'bolsasAire', val)
        )}
        {renderYesNoNAField('Aire acondicionado', form.sistemaElectrico.aireAcondicionado, (val) =>
          updateSectionField('sistemaElectrico', 'aireAcondicionado', val)
        )}
        {renderYesNoNAField('Control de crucero', form.sistemaElectrico.controlCrucero, (val) =>
          updateSectionField('sistemaElectrico', 'controlCrucero', val)
        )}
        {renderYesNoNAField('Chisguetero', form.sistemaElectrico.chisguetero, (val) =>
          updateSectionField('sistemaElectrico', 'chisguetero', val)
        )}
        {renderYesNoNAField('Luz de mapa', form.sistemaElectrico.luzMapa, (val) =>
          updateSectionField('sistemaElectrico', 'luzMapa', val)
        )}

        {renderYesNoNAField('Controles de volante', form.sistemaElectrico.controlesVolante, (val) =>
          updateSectionField('sistemaElectrico', 'controlesVolante', val)
        )}
        {renderYesNoNAField('Check engine', form.sistemaElectrico.checkEngine, (val) =>
          updateSectionField('sistemaElectrico', 'checkEngine', val)
        )}
        {renderYesNoNAField('Asientos eléctricos', form.sistemaElectrico.asientosElectricos, (val) =>
          updateSectionField('sistemaElectrico', 'asientosElectricos', val)
        )}
        {renderYesNoNAField('Encendedor', form.sistemaElectrico.encendedor, (val) =>
          updateSectionField('sistemaElectrico', 'encendedor', val)
        )}
        {renderYesNoNAField('Claxon', form.sistemaElectrico.claxon, (val) =>
          updateSectionField('sistemaElectrico', 'claxon', val)
        )}

        {renderYesNoNAField('Luces internas', form.sistemaElectrico.lucesInternas, (val) =>
          updateSectionField('sistemaElectrico', 'lucesInternas', val)
        )}
        {renderYesNoNAField('Seguros eléctricos', form.sistemaElectrico.segurosElectricos, (val) =>
          updateSectionField('sistemaElectrico', 'segurosElectricos', val)
        )}
        {renderYesNoNAField('Cristales eléctricos', form.sistemaElectrico.cristalesElectricos, (val) =>
          updateSectionField('sistemaElectrico', 'cristalesElectricos', val)
        )}
        {renderYesNoNAField('Apertura cajuela', form.sistemaElectrico.aperturaCajuela, (val) =>
          updateSectionField('sistemaElectrico', 'aperturaCajuela', val)
        )}
        {renderYesNoNAField('Pantalla', form.sistemaElectrico.pantalla, (val) =>
          updateSectionField('sistemaElectrico', 'pantalla', val)
        )}
        {renderYesNoNAField('Faros de niebla', form.sistemaElectrico.farosNiebla, (val) =>
          updateSectionField('sistemaElectrico', 'farosNiebla', val)
        )}

        {renderYesNoNAField('Luces externas', form.sistemaElectrico.lucesExternas, (val) =>
          updateSectionField('sistemaElectrico', 'lucesExternas', val)
        )}
        {renderYesNoNAField('Limpiadores', form.sistemaElectrico.limpiadores, (val) =>
          updateSectionField('sistemaElectrico', 'limpiadores', val)
        )}
        {renderYesNoNAField('Estéreo / USB', form.sistemaElectrico.estereoUsb, (val) =>
          updateSectionField('sistemaElectrico', 'estereoUsb', val)
        )}
        {renderYesNoNAField('Quemacocos', form.sistemaElectrico.quemacocos, (val) =>
          updateSectionField('sistemaElectrico', 'quemacocos', val)
        )}
        {renderYesNoNAField('Testigos', form.sistemaElectrico.testigos, (val) =>
          updateSectionField('sistemaElectrico', 'testigos', val)
        )}
        {renderYesNoNAField('Direccionales', form.sistemaElectrico.direccionales, (val) =>
          updateSectionField('sistemaElectrico', 'direccionales', val)
        )}

        {renderTextarea(
          'Comentarios',
          form.sistemaElectrico.comentarios,
          (e) => updateSectionField('sistemaElectrico', 'comentarios', e.target.value),
          'Ej. Aire acondicionado no enfría y check engine activo'
        )}
      </div>
    </section>
  );
}