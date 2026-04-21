export const styles = {
   
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.58)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 2000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    width: '100%',
    maxWidth: '1360px',
    maxHeight: '92vh',
    overflow: 'auto',
    background: '#f8fafc',
    borderRadius: '24px',
    boxShadow: '0 30px 80px rgba(15,23,42,0.28)',
    border: '1px solid rgba(255,255,255,0.4)'
  },
  hero: {
    padding: '26px 28px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 5
  },
  heroEyebrow: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  heroTitle: {
    margin: '8px 0 0 0',
    fontSize: '34px',
    lineHeight: 1.05,
    color: '#0f172a'
  },
  heroMeta: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    color: '#475569',
    fontWeight: 600
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '13px',
    textTransform: 'capitalize'
  },
  badgeDraft: {
    background: '#fff7ed',
    color: '#9a3412'
  },
  badgeWarning: {
    background: '#fef3c7',
    color: '#92400e'
  },
  badgeSuccess: {
    background: '#dcfce7',
    color: '#166534'
  },
  closeButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  body: {
    padding: '24px',
    display: 'grid',
    gap: '18px'
  },
  sectionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '20px',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(15,23,42,0.04)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#0f172a'
  },
  sectionSubtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '14px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px'
  },
  detailItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px 16px',
    display: 'grid',
    gap: '8px',
    background: '#f8fafc'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.35
  },
  monoValue: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  commentBox: {
    marginTop: '16px',
    border: '1px dashed #cbd5e1',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#f8fafc'
  },
  commentLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '8px'
  },
  commentText: {
    margin: 0,
    color: '#0f172a',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap'
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '16px'
  },
  subCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    background: '#f8fafc'
  },
  subCardTitle: {
    margin: '0 0 14px 0',
    fontSize: '16px',
    color: '#0f172a'
  },
  zoneGrid: {
    display: 'grid',
    gap: '12px'
  },
  zoneCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px'
  },
  zoneTitle: {
    display: 'block',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '10px'
  },
  chips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: '13px'
  },
  tireReportGrid: {
    display: 'grid',
    gap: '12px'
  },
  tireReportCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px',
    display: 'grid',
    gap: '10px'
  },
  valuationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px'
  },
  valuationCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    display: 'grid',
    gap: '8px'
  },
  valuationLabel: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b'
  },
  valuationValue: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#0f172a',
    lineHeight: 1.1
  },
  downloadButton: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '11px 16px',
    cursor: 'pointer',
    fontWeight: 700
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px'
  },
  photoCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 8px 20px rgba(15,23,42,0.05)'
  },
  photoPreview: {
    height: '210px',
    background: '#f8fafc'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'zoom-in'
  },
  noPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  photoFooter: {
    padding: '14px',
    display: 'grid',
    gap: '10px'
  },
  photoTag: {
    display: 'inline-flex',
    width: 'fit-content',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#4338ca',
    fontSize: '12px',
    fontWeight: 800
  },
  photoName: {
    fontSize: '13px',
    color: '#0f172a',
    wordBreak: 'break-word',
    fontWeight: 600
  },
  smallButton: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '9px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  emptyText: {
    color: '#64748b',
    margin: 0
  },
  historyList: {
    display: 'grid',
    gap: '12px'
  },
  historyCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '14px 16px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 8px 18px rgba(15,23,42,0.04)'
  },
  historyTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  historyDate: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.02em'
  },
  historyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 800
  },
  historyBody: {
    display: 'grid',
    gap: '6px'
  },
  historyUser: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#334155'
  },
  historyDetailText: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.45
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px',
    backdropFilter: 'blur(6px)'
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '92vw',
    maxHeight: '92vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewLargeImage: {
    maxWidth: '92vw',
    maxHeight: '92vh',
    objectFit: 'contain',
    borderRadius: '14px'
  },
  previewCloseButton: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    border: 'none',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 800
  }
};