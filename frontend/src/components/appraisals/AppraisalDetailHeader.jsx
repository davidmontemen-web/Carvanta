export default function AppraisalDetailHeader({
  appraisal,
  onClose,
  onDownloadPdf,
  renderStatusBadge,
  styles
}) {
  return (
    <div style={styles.hero}>
      <div>
        <p style={styles.heroEyebrow}>Reporte profesional de avalúo</p>
        <h2 style={styles.heroTitle}>{appraisal.folio || 'Detalle del avalúo'}</h2>
        <div style={styles.heroMeta}>
          <span>{appraisal.clienteNombre || 'Sin cliente'}</span>
          <span>•</span>
          <span>{appraisal.vehiculoInteres || 'Sin vehículo de interés'}</span>
        </div>
      </div>

      <div style={styles.heroActions}>
        <button style={styles.secondaryButton} onClick={onDownloadPdf}>
          Descargar PDF
        </button>
        {renderStatusBadge(appraisal.estatus)}
        <button style={styles.closeButton} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}