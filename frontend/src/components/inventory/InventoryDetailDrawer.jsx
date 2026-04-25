import { useEffect, useState } from 'react';
import { updateInventoryStatus } from '../../services/inventoryService';
import PricingView from './PricingView';
import ReacondicionamientoView from './ReacondicionamientoView';

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

const getStatusLabel = (estado) => {
  const map = {
    comprado: 'Comprado',
    en_preparacion: 'En preparación',
    en_taller: 'En taller',
    en_estetica: 'En estética',
    listo_para_publicar: 'Listo para publicar',
    publicado: 'Publicado',
    vendible: 'Vendible',
    apartado: 'Apartado',
    vendido: 'Vendido'
  };

  return map[estado] || estado || '-';
};

const getStatusStyle = (estado) => {
  const map = {
    comprado: styles.statusBlue,
    en_preparacion: styles.statusOrange,
    en_taller: styles.statusOrange,
    en_estetica: styles.statusPurple,
    listo_para_publicar: styles.statusGreen,
    publicado: styles.statusIndigo,
    vendible: styles.statusGreen,
    apartado: styles.statusAmber,
    vendido: styles.statusDark
  };

  return map[estado] || styles.statusDefault;
};

const NEXT_ACTIONS = {
  comprado: {
    next: 'reacondicionamiento',
    label: 'Iniciar reacondicionamiento'
  },
  reacondicionamiento: {
    next: 'precio_asignado',
    label: 'Finalizar reacondicionamiento y pasar a pricing'
  },
  precio_asignado: {
    next: 'publicado',
    label: 'Publicar unidad'
  },
  publicado: {
    next: 'apartado',
    label: 'Marcar como apartado'
  },
  apartado: {
    next: 'vendido',
    label: 'Registrar venta'
  }
};

export default function InventoryDetailDrawer({ open, item, onClose, onUpdated }) {
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioMinimo, setPrecioMinimo] = useState('');
  const [costoReacondicionamiento, setCostoReacondicionamiento] = useState('');
  const [estado, setEstado] = useState('');
  const [viewMode, setViewMode] = useState('detail'); // detail | pricing


  useEffect(() => {
    if (item) {
      setPrecioVenta(item.precioVenta || '');
      setPrecioMinimo(item.precioMinimo || '');
      setCostoReacondicionamiento(item.costoReacondicionamiento || '');
      setEstado(item.estado || 'comprado');
    }
  }, [item]);

  if (!open || !item) return null;

  const precioCompra = Number(item.precioCompra) || 0;
  const reacondicionamiento = Number(costoReacondicionamiento) || 0;
  const venta = Number(precioVenta) || 0;
  const costoTotal = precioCompra + reacondicionamiento;
  const utilidad = venta > 0 ? venta - costoTotal : 0;
  const margen = venta > 0 ? (utilidad / venta) * 100 : 0;

  const nextAction = NEXT_ACTIONS[estado];

const handleNextStatus = async () => {
  try {
    if (!nextAction?.next) return;

    // 👇 CLAVE: interceptar pricing
    if (estado === 'comprado') {
  setViewMode('reacondicionamiento');
  return;
}

if (estado === 'reacondicionamiento') {
  setViewMode('pricing');
  return;
}

    const confirmed = window.confirm(
      `¿Confirmas avanzar esta unidad a "${getStatusLabel(nextAction.next)}"?`
    );

    if (!confirmed) return;

    const response = await updateInventoryStatus(item.id, nextAction.next);

    if (!response?.ok) throw new Error('No se pudo actualizar');

    setEstado(nextAction.next);

    if (onUpdated) await onUpdated();

  } catch (error) {
    alert('Error al actualizar estado');
  }
};

if (viewMode === 'pricing') {
  return (
    <div style={styles.overlay}>
      <aside style={styles.drawer}>
        
        <h2>Pricing Inteligente</h2>

        <button onClick={() => setViewMode('detail')}>
          ← Volver
        </button>

        <PricingView
  inventarioId={item.id}
  onPriceAssigned={async () => {
    if (typeof onUpdated === 'function') {
      await onUpdated();
    }

    setViewMode('detail');
  }}
/>

      </aside>
    </div>
  );
}

if (viewMode === 'reacondicionamiento') {
  return (
    <div style={styles.overlay}>
      <aside style={styles.drawer}>
        <ReacondicionamientoView
          inventarioId={item.id}
          onDone={async () => {
            if (onUpdated) await onUpdated();
            setViewMode('detail');
          }}
          onBack={() => setViewMode('detail')}
        />
      </aside>
    </div>
  );
}

  return (
    <div style={styles.overlay}>
      <aside style={styles.drawer}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.eyebrow}>Detalle de inventario</p>
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
              <span style={styles.daysPill}>{item.diasInventario ?? 0} días</span>
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

        <div style={styles.kpiGrid}>
          <MiniKpi label="Compra" value={formatMoney(precioCompra)} />
          <MiniKpi label="Costo total" value={formatMoney(costoTotal)} />
          <MiniKpi label="Venta" value={venta > 0 ? formatMoney(venta) : '-'} />
          <MiniKpi
            label="Utilidad"
            value={venta > 0 ? formatMoney(utilidad) : '-'}
            tone={utilidad > 0 ? 'success' : 'default'}
          />
        </div>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Control financiero</h3>
          <p style={styles.sectionText}>
            Define precios y costos para calcular utilidad proyectada.
          </p>

          <div style={styles.formGrid}>
            <Field label="Precio de compra">
              <input value={formatMoney(precioCompra)} disabled style={styles.inputDisabled} />
            </Field>

            <Field label="Reacondicionamiento">
              <input
                type="number"
                value={costoReacondicionamiento}
                onChange={(e) => setCostoReacondicionamiento(e.target.value)}
                placeholder="0"
                style={styles.input}
              />
            </Field>

            <Field label="Precio de venta">
              <input
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                placeholder="Ej. 325000"
                style={styles.input}
              />
            </Field>

            <Field label="Precio mínimo">
              <input
                type="number"
                value={precioMinimo}
                onChange={(e) => setPrecioMinimo(e.target.value)}
                placeholder="Ej. 310000"
                style={styles.input}
              />
            </Field>
          </div>

          <div style={styles.profitBox}>
            <div>
              <span style={styles.profitLabel}>Margen proyectado</span>
              <strong style={styles.profitValue}>
                {venta > 0 ? `${margen.toFixed(1)}%` : '-'}
              </strong>
            </div>

            <div>
              <span style={styles.profitLabel}>Utilidad proyectada</span>
              <strong style={styles.profitValue}>
                {venta > 0 ? formatMoney(utilidad) : '-'}
              </strong>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Proceso operativo</h3>
          <p style={styles.sectionText}>
            Avanza la unidad según su preparación comercial.
          </p>

          <Field label="Estatus actual">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              style={styles.input}
            >
              <option value="comprado">Comprado</option>
              <option value="en_preparacion">En preparación</option>
              <option value="en_taller">En taller</option>
              <option value="en_estetica">En estética</option>
              <option value="listo_para_publicar">Listo para publicar</option>
              <option value="publicado">Publicado</option>
              <option value="vendible">Vendible</option>
              <option value="apartado">Apartado</option>
              <option value="vendido">Vendido</option>
            </select>
          </Field>

          <div style={styles.timeline}>
            <TimelineItem active label="Compra" />
            <TimelineItem active={estado !== 'comprado'} label="Preparación" />
            <TimelineItem
              active={['listo_para_publicar', 'publicado', 'vendible', 'apartado', 'vendido'].includes(estado)}
              label="Listo"
            />
            <TimelineItem
              active={['publicado', 'vendible', 'apartado', 'vendido'].includes(estado)}
              label="Publicado"
            />
            <TimelineItem
              active={['vendible', 'apartado', 'vendido'].includes(estado)}
              label="Vendible"
            />
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Checklist comercial</h3>

          <div style={styles.checklist}>
            <ChecklistItem checked={venta > 0} label="Precio de venta definido" />
            <ChecklistItem checked={Boolean(item.foto)} label="Foto principal cargada" />
            <ChecklistItem checked={estado !== 'comprado'} label="Proceso iniciado" />
            <ChecklistItem
              checked={['publicado', 'vendible', 'apartado', 'vendido'].includes(estado)}
              label="Publicación iniciada"
            />
          </div>
        </section>

        <div style={styles.actions}>
          <button type="button" style={styles.secondaryButton}>
            Ver avalúo completo
          </button>

          <button
  type="button"
  style={{
    ...styles.primaryButton,
    opacity: nextAction ? 1 : 0.5,
    cursor: nextAction ? 'pointer' : 'not-allowed'
  }}
  onClick={handleNextStatus}
  disabled={!nextAction}
>
  {nextAction ? nextAction.label : 'Flujo finalizado'}
</button>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
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
        ...(tone === 'success' ? styles.miniKpiSuccess : {})
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
    backdropFilter: 'blur(2px)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000
  },

  drawer: {
    width: 'min(760px, 96vw)',
    height: '100vh',
    background: '#f8fafc',
    overflowY: 'auto',
    boxShadow: '-24px 0 50px rgba(15, 23, 42, 0.25)',
    padding: '20px',
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
    fontSize: '26px',
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
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 900
  },

  vehicleHero: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '14px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '14px',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)'
  },

  photoBox: {
    width: '240px',
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
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },

  statusBadge: {
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900
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
    gridTemplateColumns: '1fr 1fr',
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

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginTop: '12px'
  },

  miniKpi: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '12px',
    display: 'grid',
    gap: '4px'
  },

  miniKpiSuccess: {
    background: '#ecfdf5',
    borderColor: '#a7f3d0'
  },

  miniKpiLabel: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 800
  },

  miniKpiValue: {
    color: '#0f172a',
    fontSize: '15px',
    fontWeight: 950
  },

  section: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '16px',
    marginTop: '12px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },

  sectionTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 950
  },

  sectionText: {
    margin: '5px 0 12px 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.35
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },

  field: {
    display: 'grid',
    gap: '6px'
  },

  fieldLabel: {
    color: '#334155',
    fontSize: '12px',
    fontWeight: 900
  },

  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '11px 12px',
    color: '#0f172a',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box'
  },

  inputDisabled: {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '11px 12px',
    color: '#64748b',
    background: '#f8fafc',
    fontSize: '14px',
    fontWeight: 800,
    outline: 'none',
    boxSizing: 'border-box'
  },

  profitBox: {
    marginTop: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },

  profitLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800
  },

  profitValue: {
    display: 'block',
    marginTop: '4px',
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: 950
  },

  timeline: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
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

  actions: {
    position: 'sticky',
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(248,250,252,0.1), #f8fafc 35%)',
    paddingTop: '14px',
    marginTop: '14px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  primaryButton: {
    border: 'none',
    background: '#0f172a',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '13px 14px',
    fontWeight: 950,
    cursor: 'pointer'
  },

  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '13px 14px',
    fontWeight: 950,
    cursor: 'pointer'
  },

  statusBlue: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe'
  },

  statusOrange: {
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa'
  },

  statusPurple: {
    background: '#f5f3ff',
    color: '#6d28d9',
    border: '1px solid #ddd6fe'
  },

  statusGreen: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0'
  },

  statusIndigo: {
    background: '#eef2ff',
    color: '#4338ca',
    border: '1px solid #c7d2fe'
  },

  statusAmber: {
    background: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a'
  },

  statusDark: {
    background: '#f3f4f6',
    color: '#111827',
    border: '1px solid #d1d5db'
  },

  statusDefault: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0'
  }
};