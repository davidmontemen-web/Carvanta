export const styles = {
  popupOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.48)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 90
  },
  popupCard: {
    width: 'min(540px, 100%)',
    background: '#fff',
    border: '1px solid #dbe4f0',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
    padding: '18px',
    display: 'grid',
    gap: '12px'
  },
  popupTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: 900
  },
  popupText: {
    margin: 0,
    color: '#334155',
    lineHeight: 1.5,
    fontSize: '13px',
    whiteSpace: 'pre-wrap'
  },
  workspace: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '16px',
    alignItems: 'start'
  },

  sidebar: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '14px',
    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)',
    border: '1px solid #dbe4f0',
    position: 'sticky',
    top: '12px',
    alignSelf: 'start'
  },
  sidebarHeader: {
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eef2f7'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '15px',
    color: '#0f172a',
    fontWeight: 800,
    letterSpacing: '-0.02em'
  },
  sidebarText: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: 1.4
  },

  sectionNav: {
    display: 'grid',
    gap: '7px'
  },
  sectionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    padding: '8px 10px',
    borderRadius: '12px',
    border: '1px solid #dbe4f0',
    background: '#fbfdff',
    color: '#334155',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.18s ease'
  },
  sectionButtonActive: {
    background: '#0f172a',
    border: '1px solid #0f172a',
    color: '#ffffff',
    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.14)'
  },

  navStatus: {
    fontSize: '10px',
    fontWeight: 800,
    padding: '3px 7px',
    borderRadius: '999px',
    whiteSpace: 'nowrap'
  },
  navStatusOk: {
    background: '#dcfce7',
    color: '#166534'
  },
  navStatusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },

  main: {
    display: 'grid',
    gap: '12px'
  },

  heroCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '14px 16px',
    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)',
    border: '1px solid #dbe4f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '6px'
  },
  formTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#0f172a',
    lineHeight: 1.05,
    fontWeight: 800,
    letterSpacing: '-0.02em'
  },
  formMeta: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: 1.4
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },

  sectionCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '14px',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
    border: '1px solid #dbe4f0'
  },
  sectionCardActive: {
    border: '1px solid #bfdbfe',
    boxShadow: '0 14px 26px rgba(37, 99, 235, 0.12)'
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eaf0f7'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  helperText: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px',
    lineHeight: 1.4
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  },

  field: {
    display: 'grid',
    gap: '4px'
  },
  fieldFull: {
    display: 'grid',
    gap: '4px',
    marginTop: '10px'
  },

  label: {
    fontWeight: 700,
    fontSize: '10px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '12px',
    background: '#ffffff',
    color: '#111827',
    minHeight: '38px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputDisabled: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '12px',
    background: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed',
    minHeight: '38px',
    boxSizing: 'border-box'
  },
  inputReadOnly: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '12px',
    background: '#f8fafc',
    color: '#475569',
    minHeight: '38px',
    boxSizing: 'border-box'
  },
  inputRequired: {
    border: '1px solid #f59e0b',
    background: '#fffbeb'
  },
  inputError: {
    border: '1px solid #ef4444',
    background: '#fef2f2'
  },

  helperError: {
    display: 'block',
    marginTop: '4px',
    fontSize: '11px',
    color: '#b91c1c',
    fontWeight: 600
  },

  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    resize: 'vertical',
    fontSize: '12px',
    minHeight: '76px',
    color: '#111827',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none'
  },

  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px'
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fafafa',
    fontSize: '11px',
    color: '#334155'
  },

  radioGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600
  },

  toggleGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  toggleButton: {
    minWidth: '30px',
    height: '28px',
    padding: '4px 8px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  toggleYesActive: {
    background: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#166534'
  },
  toggleNoActive: {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#7f1d1d'
  },
  toggleNAActive: {
    background: '#e5e7eb',
    border: '1px solid #9ca3af',
    color: '#374151'
  },

  conditionGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  conditionButton: {
    minWidth: '68px',
    padding: '6px 8px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    color: '#334155',
    transition: 'all 0.2s ease'
  },
  conditionExcellent: {
    background: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#166534'
  },
  conditionGood: {
    background: '#dbeafe',
    border: '1px solid #3b82f6',
    color: '#1d4ed8'
  },
  conditionRegular: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e'
  },
  conditionBad: {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b'
  },

  primaryButton: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px',
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.22)'
  },
  secondaryButton: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px',
    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.06)'
  },
  disabledButton: {
    background: '#e5e7eb',
    color: '#9ca3af',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'not-allowed',
    fontWeight: 700,
    fontSize: '12px'
  },

  infoBox: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '12px',
    border: '1px solid #bfdbfe'
  },
  warningBox: {
    background: '#fff7ed',
    color: '#9a3412',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '12px',
    border: '1px solid #fed7aa',
    marginBottom: '10px'
  },
  notificationBox: {
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '12px',
    border: '1px solid transparent',
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.05)'
  },
  notificationSuccess: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  notificationWarning: {
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa'
  },
  notificationError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },

  generalPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  },
  generalPhotoCard: {
    border: '1px solid #dbe4f0',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#ffffff'
  },
  generalPhotoPreview: {
    height: '138px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  silhouetteBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280'
  },
  silhouetteIcon: {
    fontSize: '20px'
  },
  silhouetteText: {
    fontSize: '11px',
    fontWeight: 700
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  generalPhotoFooter: {
    padding: '9px',
    display: 'grid',
    gap: '8px'
  },
  slotActions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  smallButton: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px'
  },
  smallDangerButton: {
    background: '#ffffff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px'
  },

  detailPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  detailPhotoCard: {
    border: '1px solid #dbe4f0',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#ffffff'
  },
  detailPhotoPreview: {
    height: '138px',
    background: '#f8fafc'
  },
  detailPhotoInfo: {
    padding: '9px',
    display: 'grid',
    gap: '8px'
  },
  detailPhotoName: {
    fontSize: '11px',
    color: '#111827',
    wordBreak: 'break-word'
  },
  emptyPhotoBox: {
    border: '1px dashed #d1d5db',
    borderRadius: '12px',
    padding: '14px',
    color: '#6b7280',
    textAlign: 'center',
    fontSize: '12px'
  },

  carroceriaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  subsectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  subsectionTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f172a'
  },
  damageZoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  damageZoneCard: {
    border: '1px solid #dbe4f0',
    borderRadius: '14px',
    padding: '12px',
    background: '#fbfdff'
  },
  damageZoneHeader: {
    marginBottom: '8px'
  },
  damageZoneTitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: '#0f172a'
  },
  damageChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  damageChip: {
    border: '1px solid #d1d5db',
    borderRadius: '999px',
    padding: '6px 9px',
    background: '#ffffff',
    color: '#334155',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  damageChipActive: {
    background: '#dbeafe',
    border: '1px solid #3b82f6',
    color: '#1d4ed8'
  },

  tireGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  tireCard: {
    border: '1px solid #dbe4f0',
    borderRadius: '14px',
    padding: '12px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tireCardTitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: '#0f172a'
  },

  validationGrid: {
    display: 'grid',
    gap: '8px'
  },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #dbe4f0',
    borderRadius: '12px',
    background: '#fbfdff'
  },
  statusPill: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 800
  },
  statusOk: {
    background: '#dcfce7',
    color: '#166534'
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },

  bottomBar: {
    position: 'sticky',
    bottom: '0',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid #dbe4f0',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '10px',
    borderBottomLeftRadius: '14px',
    borderBottomRightRadius: '14px',
    boxShadow: '0 -10px 24px rgba(15, 23, 42, 0.08)'
  },
  bottomBarText: {
    color: '#4b5563',
    fontWeight: 600,
    fontSize: '12px'
  }
};
