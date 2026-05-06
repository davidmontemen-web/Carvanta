function LocalSectionCard({ title, subtitle, styles, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {subtitle ? <p style={styles.sectionSubtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AppraisalDetailHistorySection({
  styles,
  historyLoading,
  history,
  followups,
  onAddFollowup,
  formatHistoryDateTime,
  formatHistoryAction,
  getHistoryAccent,
  toDisplayValue
}) {
  return (
    <>
    <LocalSectionCard title="Historial del sistema" subtitle="Bitácora real de cambios del expediente." styles={styles}>
      {historyLoading ? (
        <p style={styles.emptyText}>Cargando historial...</p>
      ) : history.length ? (
        <div style={styles.historyList}>
          {history.map((item) => {
            const accent = getHistoryAccent(item.accion);

            return (
              <div key={item.id} style={styles.historyCard}>
                <div style={styles.historyTopRow}>
                  <span style={styles.historyDate}>
                    {formatHistoryDateTime(item.created_at)}
                  </span>

                  <span
                    style={{
                      ...styles.historyBadge,
                      background: accent.bg,
                      borderColor: accent.border,
                      color: accent.text
                    }}
                  >
                    {formatHistoryAction(item.accion)}
                  </span>
                </div>

                <div style={styles.historyBody}>
                  <div style={styles.historyUser}>
                    {toDisplayValue(item.usuario_nombre)}
                  </div>

                  <div style={styles.historyDetailText}>
                    {toDisplayValue(item.detalle)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.emptyText}>Sin historial.</p>
      )}
    </LocalSectionCard>
    <LocalSectionCard title="Seguimiento comercial" subtitle="Registro de contactos y próximos pasos." styles={styles}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button style={styles.secondaryButton} onClick={onAddFollowup}>Agregar seguimiento</button>
      </div>
      {followups?.length ? (
        <div style={styles.historyList}>
          {followups.map((item) => (
            <div key={`f-${item.id}`} style={styles.historyCard}>
              <div style={styles.historyTopRow}>
                <span style={styles.historyDate}>{formatHistoryDateTime(item.created_at)}</span>
              </div>
              <div style={styles.historyDetailText}>{toDisplayValue(item.comentario)}</div>
            </div>
          ))}
        </div>
      ) : <p style={styles.emptyText}>Sin seguimientos.</p>}
    </LocalSectionCard>
    </>
  );
}
