import { useEffect, useState } from 'react';
import { getInventoryPublications, updateInventoryStatus } from '../../services/inventoryService';
import PricingView from './PricingView';
import ReacondicionamientoView from './ReacondicionamientoView';
import PublicacionView from './PublicacionView';


const FLOW = [
  'comprado',
  'reacondicionamiento',
  'precio_asignado',
  'publicado',
  'apartado',
  'vendido'
];

const NEXT_ACTIONS = {
  comprado: {
    next: 'reacondicionamiento',
    label: 'Iniciar reacondicionamiento',
    tab: 'reacondicionamiento'
  },
  reacondicionamiento: {
    next: null,
    label: 'Abrir Pricing',
    tab: 'pricing'
  },
  precio_asignado: {
    next: 'publicado',
    label: 'Publicar unidad',
    tab: 'publicacion'
  },
  publicado: {
    next: 'apartado',
    label: 'Marcar como apartado',
    tab: 'resumen'
  },
  apartado: {
    next: 'vendido',
    label: 'Registrar venta',
    tab: 'resumen'
  }
};

const getSectionMode = ({ tab, estado, costoReacondicionamiento, precioVenta }) => {
  if (tab === 'resumen' || tab === 'historial') return 'visible';

  if (tab === 'reacondicionamiento') {
    if (estado === 'comprado') return 'bloqueado';
    if (['reacondicionamiento'].includes(estado)) return 'editable';
    return 'finalizado';
  }

  if (tab === 'pricing') {
    if (estado === 'comprado') return 'bloqueado';

    if (estado === 'reacondicionamiento') {
      return costoReacondicionamiento > 0 ? 'editable' : 'bloqueado';
    }

    if (precioVenta > 0 || ['precio_asignado', 'publicado', 'apartado', 'vendido'].includes(estado)) {
      return 'finalizado';
    }

    return 'bloqueado';
  }

  if (tab === 'publicacion') {
    if (['precio_asignado'].includes(estado)) return 'editable';
    if (['publicado', 'apartado', 'vendido'].includes(estado)) return 'finalizado';
    return 'bloqueado';
  }

  return 'bloqueado';
};

const getLockedMessage = (tab) => {
  const map = {
    reacondicionamiento: 'Para habilitar Reacondicionamiento, inicia el proceso desde Resumen.',
    pricing: 'Para habilitar Pricing, primero finaliza Reacondicionamiento con al menos un gasto registrado.',
    publicacion: 'Para habilitar Publicación, primero debes tener precio asignado.'
  };

  return map[tab] || 'Esta sección aún no está disponible.';
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(numeric);
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;

  return new Intl.NumberFormat('es-MX').format(numeric);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-MX');
};

const getStatusLabel = (estado) => {
  const map = {
    comprado: 'Comprado',
    reacondicionamiento: 'Reacondicionamiento',
    precio_asignado: 'Precio asignado',
    publicado: 'Publicado',
    apartado: 'Apartado',
    vendido: 'Vendido',
    detenido: 'Detenido',
    no_vendible: 'No vendible'
  };

  return map[estado] || estado || '-';
};

const getStatusStyle = (estado) => {
  const map = {
    comprado: styles.statusBlue,
    reacondicionamiento: styles.statusOrange,
    precio_asignado: styles.statusPurple,
    publicado: styles.statusIndigo,
    apartado: styles.statusAmber,
    vendido: styles.statusDark,
    detenido: styles.statusRed,
    no_vendible: styles.statusRed
  };

  return map[estado] || styles.statusDefault;
};

export default function InventoryDetailDrawer({ open, item, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [estado, setEstado] = useState('comprado');
  const [publicationEvents, setPublicationEvents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setEstado(item.estado || 'comprado');
      setActiveTab('resumen');
    }
  }, [item]);

  const precioCompra = Number(item?.precioCompra) || 0;
  const costoReacondicionamiento = Number(item?.costoReacondicionamiento) || 0;
  const precioVenta = Number(item?.precioVenta) || 0;
  const costoTotal = precioCompra + costoReacondicionamiento;
  const utilidad = precioVenta > 0 ? precioVenta - costoTotal : 0;
  const margen = precioVenta > 0 ? (utilidad / precioVenta) * 100 : 0;
  const nextAction = NEXT_ACTIONS[estado];

  const sectionModes = {
  resumen: 'visible',
  reacondicionamiento: getSectionMode({
    tab: 'reacondicionamiento',
    estado,
    costoReacondicionamiento,
    precioVenta
  }),
  pricing: getSectionMode({
    tab: 'pricing',
    estado,
    costoReacondicionamiento,
    precioVenta
  }),
  publicacion: getSectionMode({
    tab: 'publicacion',
    estado,
    costoReacondicionamiento,
    precioVenta
  }),
  historial: 'visible'
};

  const handleRefresh = async () => {
    if (typeof onUpdated === 'function') {
      await onUpdated();
    }
  };

  const loadPublicationHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getInventoryPublications(item.id);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo cargar historial de publicación');
      }

      setPublicationEvents(response.eventos || []);
    } catch (error) {
      console.error('Error cargando historial de publicación:', error);
      setPublicationEvents([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!item?.id || activeTab !== 'historial') return;
    loadPublicationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, item?.id]);

  if (!open || !item) return null;

  const handleMainAction = async () => {
    try {
      if (!nextAction) return;

      if (!nextAction.next) {
        setActiveTab(nextAction.tab);
        return;
      }

      const confirmed = window.confirm(
        `¿Confirmas avanzar esta unidad a "${getStatusLabel(nextAction.next)}"?`
      );

      if (!confirmed) return;

      const response = await updateInventoryStatus(item.id, nextAction.next);

      if (!response?.ok) {
        throw new Error('No se pudo actualizar el estado');
      }

      setEstado(nextAction.next);
      setActiveTab(nextAction.tab || 'resumen');

      await handleRefresh();
    } catch (error) {
      console.error('Error al avanzar flujo:', error);
      alert(error?.message || 'No se pudo avanzar el flujo.');
    }
  };

  return (
    <div style={styles.overlay}>
      <aside style={styles.drawer}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.eyebrow}>Dashboard de unidad</p>
            <h2 style={styles.title}>
              {[item.marca, item.submarca].filter(Boolean).join(' ') || 'Unidad sin nombre'}
            </h2>
            <p style={styles.subtitle}>{item.folio || '-'}</p>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <section style={styles.vehicleHero}>
          <div style={styles.photoBox}>
            {item.foto ? (
              <img
                src={item.foto}
                alt={`${item.marca || ''} ${item.submarca || ''}`}
                style={styles.vehicleImage}
              />
            ) : (
              <div style={styles.imagePlaceholder}>Sin imagen</div>
            )}
          </div>

          <div style={styles.generalInfoBox}>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(estado) }}>
                {getStatusLabel(estado)}
              </span>

              <span style={styles.daysPill}>
                {item.diasInventario ?? 0} días
              </span>
            </div>

            <h3 style={styles.vehicleTitle}>
              {[item.marca, item.submarca, item.version].filter(Boolean).join(' ') || '-'}
            </h3>

            <div style={styles.infoGrid}>
              <InfoItem label="Año" value={item.anio} />
              <InfoItem label="Kilometraje" value={`${formatNumber(item.km)} km`} />
              <InfoItem label="Color" value={item.color} />
              <InfoItem label="Transmisión" value={item.transmision} />
              <InfoItem label="Placas" value={item.placas} />
              <InfoItem label="Dueños" value={item.numeroDuenos} />
            </div>

            <div style={styles.vinBox}>
              <span style={styles.vinLabel}>Número de serie</span>
              <strong style={styles.vinValue}>{item.numeroSerie || '-'}</strong>
            </div>
          </div>
        </section>

        <div style={styles.tabs}>
          {[
            { key: 'resumen', label: 'Resumen' },
            { key: 'reacondicionamiento', label: 'Reacondicionamiento' },
            { key: 'pricing', label: 'Pricing' },
            { key: 'publicacion', label: 'Publicación' },
            { key: 'historial', label: 'Historial' }
          ].map((tab) => {
            const mode = sectionModes[tab.key];
            const statusIcon = mode === 'bloqueado' ? '🔒' : mode === 'finalizado' ? '✓' : null;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.key ? styles.tabActive : {})
                }}
              >
                <span>{tab.label}</span>
                {statusIcon ? <span style={styles.tabIcon}>{statusIcon}</span> : null}
              </button>
            );
          })}
        </div>

        {activeTab === 'resumen' && (
          <>
            <div style={styles.kpiGrid}>
              <MiniKpi label="Compra" value={formatMoney(precioCompra)} />
              <MiniKpi label="Reacond." value={formatMoney(costoReacondicionamiento)} />
              <MiniKpi label="Costo total" value={formatMoney(costoTotal)} />
              <MiniKpi label="Venta" value={precioVenta > 0 ? formatMoney(precioVenta) : '-'} />
              <MiniKpi
                label="Utilidad"
                value={precioVenta > 0 ? formatMoney(utilidad) : '-'}
                tone={utilidad > 0 ? 'success' : utilidad < 0 ? 'danger' : 'default'}
              />
              <MiniKpi
                label="Margen"
                value={precioVenta > 0 ? `${margen.toFixed(1)}%` : '-'}
              />
            </div>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Flujo operativo</h3>
              <p style={styles.sectionText}>
                Consulta el avance completo de la unidad. El flujo guía la siguiente acción, pero no oculta etapas anteriores.
              </p>

              <div style={styles.timeline}>
                {FLOW.map((step) => (
                  <TimelineItem
                    key={step}
                    active={FLOW.indexOf(step) <= FLOW.indexOf(estado)}
                    label={getStatusLabel(step)}
                  />
                ))}
              </div>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Próxima acción recomendada</h3>
              <p style={styles.sectionText}>
                {nextAction
                  ? `Siguiente paso: ${nextAction.label}.`
                  : 'El flujo principal de esta unidad ya está finalizado o detenido.'}
              </p>

              <button
                type="button"
                onClick={handleMainAction}
                disabled={!nextAction}
                style={{
                  ...styles.primaryButton,
                  opacity: nextAction ? 1 : 0.55,
                  cursor: nextAction ? 'pointer' : 'not-allowed'
                }}
              >
                {nextAction ? nextAction.label : 'Sin acción disponible'}
              </button>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Checklist comercial</h3>

              <div style={styles.checklist}>
                <ChecklistItem checked={Boolean(item.foto)} label="Foto principal cargada" />
                <ChecklistItem checked={costoReacondicionamiento > 0} label="Costo de reacondicionamiento registrado" />
                <ChecklistItem checked={precioVenta > 0} label="Precio de venta asignado" />
                <ChecklistItem checked={['publicado', 'apartado', 'vendido'].includes(estado)} label="Publicación iniciada" />
              </div>
            </section>
          </>
        )}

        {activeTab === 'reacondicionamiento' && (
  sectionModes.reacondicionamiento === 'bloqueado' ? (
    <LockedSection
      title="Reacondicionamiento bloqueado"
      message={getLockedMessage('reacondicionamiento')}
      buttonLabel="Ir a Resumen"
      onClick={() => setActiveTab('resumen')}
    />
  ) : (
    <ReacondicionamientoView
      inventarioId={item.id}
      estadoActual={estado}
      mode={sectionModes.reacondicionamiento}
      onDone={async () => {
        if (estado === 'comprado') {
          const response = await updateInventoryStatus(item.id, 'reacondicionamiento');

          if (!response?.ok) {
            alert('No se pudo avanzar a reacondicionamiento');
            return;
          }

          setEstado('reacondicionamiento');
        }

        await handleRefresh();
        setActiveTab('pricing');
      }}
      onBack={() => setActiveTab('resumen')}
    />
  )
)}

        {activeTab === 'pricing' && (
  sectionModes.pricing === 'bloqueado' ? (
    <LockedSection
      title="Pricing bloqueado"
      message={getLockedMessage('pricing')}
      buttonLabel="Ir a Reacondicionamiento"
      onClick={() => setActiveTab('reacondicionamiento')}
    />
  ) : (
    <PricingView
      inventarioId={item.id}
      mode={sectionModes.pricing}
      onPriceAssigned={async () => {
        await handleRefresh();
        setEstado('precio_asignado');
        setActiveTab('resumen');
      }}
    />
  )
)}

        {activeTab === 'publicacion' && (
  sectionModes.publicacion === 'bloqueado' ? (
    <LockedSection
      title="Publicación bloqueada"
      message={getLockedMessage('publicacion')}
      buttonLabel="Ir a Pricing"
      onClick={() => setActiveTab('pricing')}
    />
  ) : (
    <PublicacionView
      inventarioId={item.id}
      mode={sectionModes.publicacion}
      onPublished={async () => {
        await handleRefresh();
        setEstado('publicado');
        setActiveTab('historial');
      }}
    />
  )
)}

        {activeTab === 'historial' && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Historial</h3>
            <p style={styles.sectionText}>
              Bitácora operativa de publicación (eventos y cambios de estado por canal).
            </p>

            {historyLoading ? (
              <div style={styles.emptyBox}>Cargando historial...</div>
            ) : !publicationEvents.length ? (
              <div style={styles.emptyBox}>Sin eventos de publicación registrados.</div>
            ) : (
              <div style={styles.historyList}>
                {publicationEvents.map((event) => (
                  <div key={event.id} style={styles.historyItem}>
                    <strong style={styles.historyType}>{event.tipo || 'evento'}</strong>
                    <span style={styles.historyMeta}>
                      {event.canal || 'general'} · {formatDateTime(event.created_at)}
                    </span>
                    <p style={styles.historyDetail}>{event.detalle || '-'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}

function LockedSection({ title, message, buttonLabel, onClick }) {
  return (
    <section style={styles.lockedSection}>
      <div style={styles.lockIcon}>🔒</div>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <p style={styles.sectionText}>{message}</p>

      {buttonLabel && (
        <button type="button" style={styles.secondaryButton} onClick={onClick}>
          {buttonLabel}
        </button>
      )}
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || '-'}</strong>
    </div>
  );
}

function MiniKpi({ label, value, tone = 'default' }) {
  return (
    <div
      style={{
        ...styles.miniKpi,
        ...(tone === 'success' ? styles.miniKpiSuccess : {}),
        ...(tone === 'danger' ? styles.miniKpiDanger : {})
      }}
    >
      <span style={styles.miniKpiLabel}>{label}</span>
      <strong style={styles.miniKpiValue}>{value}</strong>
    </div>
  );
}

function TimelineItem({ active, label }) {
  return (
    <div style={styles.timelineItem}>
      <span
        style={{
          ...styles.timelineDot,
          ...(active ? styles.timelineDotActive : {})
        }}
      />
      <span
        style={{
          ...styles.timelineText,
          ...(active ? styles.timelineTextActive : {})
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ChecklistItem({ checked, label }) {
  return (
    <div style={styles.checkItem}>
      <span
        style={{
          ...styles.checkIcon,
          ...(checked ? styles.checkIconActive : {})
        }}
      >
        {checked ? '✓' : '•'}
      </span>
      <span style={styles.checkText}>{label}</span>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000
  },
  drawer: {
    width: 'min(860px, 96vw)',
    height: '100vh',
    background: 'linear-gradient(180deg, #f8fbff 0%, #f8fafc 100%)',
    overflowY: 'auto',
    boxShadow: '-24px 0 50px rgba(15, 23, 42, 0.25)',
    padding: '22px',
    boxSizing: 'border-box'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '12px'
  },
  eyebrow: {
    margin: 0,
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  title: {
    margin: '4px 0 0 0',
    color: '#0f172a',
    fontSize: '28px',
    lineHeight: 1.05,
    fontWeight: 950
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 700
  },
  closeButton: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: '1px solid #dbe4f0',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 900,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)'
  },
  vehicleHero: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '16px',
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '22px',
    padding: '16px',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)'
  },
  photoBox: {
    width: '260px',
    height: '210px',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#e2e8f0'
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: '#64748b',
    fontWeight: 800
  },
  generalInfoBox: {
    minWidth: 0
  },
  statusRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
    border: '1px solid transparent'
  },
  lockedSection: {
  background: '#ffffff',
  border: '1px dashed #cbd5e1',
  borderRadius: '20px',
  padding: '28px',
  marginTop: '12px',
  textAlign: 'center',
  color: '#334155'
},

lockIcon: {
  width: '46px',
  height: '46px',
  borderRadius: '999px',
  display: 'grid',
  placeItems: 'center',
  background: '#f1f5f9',
  margin: '0 auto 12px auto',
  fontSize: '22px'
},
  daysPill: {
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    fontSize: '12px',
    fontWeight: 900
  },
  vehicleTitle: {
    margin: '0 0 10px 0',
    color: '#0f172a',
    fontSize: '20px',
    lineHeight: 1.2,
    fontWeight: 950
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  infoItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '8px 10px'
  },
  infoLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 800
  },
  infoValue: {
    display: 'block',
    marginTop: '3px',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 900
  },
  vinBox: {
    marginTop: '8px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '8px 10px'
  },
  vinLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 800
  },
  vinValue: {
    display: 'block',
    marginTop: '3px',
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: 900,
    wordBreak: 'break-all'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginTop: '14px',
    marginBottom: '12px',
    padding: '10px',
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '18px',
    overflowX: 'auto'
  },
  tab: {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#334155',
    padding: '9px 12px',
    borderRadius: '12px',
    fontWeight: 900,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  tabActive: {
    background: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a'
  },
  tabIcon: {
    fontSize: '12px',
    lineHeight: 1
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  miniKpi: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '16px',
    padding: '12px',
    display: 'grid',
    gap: '4px',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.03)'
  },
  miniKpiSuccess: {
    background: '#ecfdf5',
    borderColor: '#a7f3d0'
  },
  miniKpiDanger: {
    background: '#fef2f2',
    borderColor: '#fecaca'
  },
  miniKpiLabel: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 800
  },
  miniKpiValue: {
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 950
  },
  section: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '16px',
    marginTop: '12px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)'
  },
  sectionTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 950
  },
  sectionText: {
    margin: '6px 0 12px 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.35
  },
  timeline: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px'
  },
  timelineItem: {
    display: 'grid',
    justifyItems: 'center',
    gap: '6px',
    textAlign: 'center'
  },
  timelineDot: {
    width: '14px',
    height: '14px',
    borderRadius: '999px',
    background: '#e2e8f0',
    border: '2px solid #cbd5e1'
  },
  timelineDotActive: {
    background: '#2563eb',
    borderColor: '#bfdbfe'
  },
  timelineText: {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 800,
    lineHeight: 1.2
  },
  timelineTextActive: {
    color: '#0f172a'
  },
  checklist: {
    display: 'grid',
    gap: '10px',
    marginTop: '12px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#334155',
    fontSize: '13px',
    fontWeight: 800
  },
  checkIcon: {
    width: '22px',
    height: '22px',
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    background: '#f1f5f9',
    color: '#94a3b8',
    fontWeight: 950,
    flexShrink: 0
  },
  checkIconActive: {
    background: '#dcfce7',
    color: '#15803d'
  },
  checkText: {
    lineHeight: 1.25
  },
  primaryButton: {
    border: 'none',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '13px 14px',
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.22)'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '11px 14px',
    fontWeight: 900,
    cursor: 'pointer'
  },
  emptyBox: {
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '14px',
    padding: '18px',
    color: '#64748b',
    fontWeight: 700,
    textAlign: 'center'
  },
  historyList: {
    display: 'grid',
    gap: '8px',
    marginTop: '10px'
  },
  historyItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px'
  },
  historyType: {
    display: 'block',
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: 900
  },
  historyMeta: {
    display: 'block',
    marginTop: '2px',
    color: '#64748b',
    fontSize: '11px'
  },
  historyDetail: {
    margin: '5px 0 0 0',
    color: '#334155',
    fontSize: '12px',
    lineHeight: 1.35
  },
  statusBlue: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderColor: '#bfdbfe'
  },
  statusOrange: {
    background: '#fff7ed',
    color: '#c2410c',
    borderColor: '#fed7aa'
  },
  statusPurple: {
    background: '#f5f3ff',
    color: '#6d28d9',
    borderColor: '#ddd6fe'
  },
  statusIndigo: {
    background: '#eef2ff',
    color: '#4338ca',
    borderColor: '#c7d2fe'
  },
  statusAmber: {
    background: '#fef3c7',
    color: '#92400e',
    borderColor: '#fde68a'
  },
  statusDark: {
    background: '#f3f4f6',
    color: '#111827',
    borderColor: '#d1d5db'
  },
  statusRed: {
    background: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fecaca'
  },
  statusDefault: {
    background: '#f8fafc',
    color: '#334155',
    borderColor: '#e2e8f0'
  }
};
