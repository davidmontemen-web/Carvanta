export const styles = {
    
  workspace: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '12px',
    alignItems: 'start'
  },
  sidebar: {
    background: '#fff',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '12px',
    alignSelf: 'start'
  },
  sidebarHeader: {
    marginBottom: '10px'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#111827',
    fontWeight: 800
  },
  sidebarText: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px',
    lineHeight: 1.35
  },
  sectionNav: {
    display: 'grid',
    gap: '6px'
  },
  sectionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    padding: '7px 9px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'left'
  },
  sectionButtonActive: {
    background: '#eff6ff',
    border: '1px solid #93c5fd',
    color: '#1d4ed8'
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
    gap: '10px'
  },
  heroCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '10px 12px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '8px'
  },
  formTitle: {
    margin: 0,
    fontSize: '17px',
    color: '#111827',
    lineHeight: 1.1,
    fontWeight: 800
  },
  formMeta: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px'
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  sectionCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.04)',
    border: '1px solid transparent'
  },
  sectionCardActive: {
    border: '1px solid #dbe3ee'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 800,
    color: '#111827'
  },
  helperText: {
    margin: '4px 0 0 0',
    color: '#6b7280',
    fontSize: '11px',
    lineHeight: 1.35
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
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#fff',
    color: '#111827',
    minHeight: '34px'
  },
  inputDisabled: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed',
    minHeight: '34px'
  },
  inputReadOnly: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f8fafc',
    color: '#475569',
    minHeight: '34px'
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
    padding: '9px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'vertical',
    fontSize: '13px',
    minHeight: '78px',
    color: '#111827',
    background: '#fff'
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
    fontSize: '12px'
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
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
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
    minWidth: '72px',
    padding: '6px 8px',
    borderRadius: '7px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
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
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px'
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
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)'
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
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff'
  },
  generalPhotoPreview: {
    height: '150px',
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
    fontSize: '22px'
  },
  silhouetteText: {
    fontSize: '12px',
    fontWeight: 700
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  generalPhotoFooter: {
    padding: '10px',
    display: 'grid',
    gap: '8px'
  },
  slotActions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  smallButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px'
  },
  smallDangerButton: {
    background: '#fff',
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
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff'
  },
  detailPhotoPreview: {
    height: '150px',
    background: '#f8fafc'
  },
  detailPhotoInfo: {
    padding: '10px',
    display: 'grid',
    gap: '8px'
  },
  detailPhotoName: {
    fontSize: '12px',
    color: '#111827',
    wordBreak: 'break-word'
  },
  emptyPhotoBox: {
    border: '1px dashed #d1d5db',
    borderRadius: '12px',
    padding: '16px',
    color: '#6b7280',
    textAlign: 'center',
    fontSize: '12px'
  },
  carroceriaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  subsectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  subsectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a'
  },
  damageZoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  damageZoneCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px',
    background: '#f8fafc'
  },
  damageZoneHeader: {
    marginBottom: '8px'
  },
  damageZoneTitle: {
    margin: 0,
    fontSize: '13px',
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
    padding: '6px 10px',
    background: '#ffffff',
    color: '#334155',
    fontSize: '11px',
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
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tireCardTitle: {
    margin: 0,
    fontSize: '13px',
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
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    background: '#fafafa'
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
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #e5e7eb',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  bottomBarText: {
    color: '#4b5563',
    fontWeight: 600,
    fontSize: '12px'
  }
};