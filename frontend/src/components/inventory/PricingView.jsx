import { useEffect, useState } from 'react';
import {
  getInventoryPricing,
  addInventoryComparable,
  assignInventoryPrice
} from '../../services/inventoryService';

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

export default function PricingView({ inventarioId, onPriceAssigned }) {
  const [comparables, setComparables] = useState([]);
  const [calculo, setCalculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingComparable, setSavingComparable] = useState(false);
  const [assigningPrice, setAssigningPrice] = useState(false);

  const [form, setForm] = useState({
    fuente: '',
    anio: '',
    km: '',
    precio: '',
    link: '',
    observaciones: ''
  });

  const [precioFinal, setPrecioFinal] = useState('');

  const loadPricing = async () => {
    try {
      setLoading(true);

      const data = await getInventoryPricing(inventarioId);

      setComparables(data.comparables || []);
      setCalculo(data.calculo || null);

      if (!precioFinal && data.calculo?.precioSugerido) {
        setPrecioFinal(String(data.calculo.precioSugerido));
      }
    } catch (error) {
      console.error('Error cargando pricing:', error);
      alert('Error cargando pricing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventarioId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddComparable = async () => {
    try {
      if (!form.fuente || !form.precio) {
        alert('Fuente y precio son obligatorios');
        return;
      }

      setSavingComparable(true);

      const response = await addInventoryComparable(inventarioId, form);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo agregar el comparable');
      }

      setForm({
        fuente: '',
        anio: '',
        km: '',
        precio: '',
        link: '',
        observaciones: ''
      });

      await loadPricing();
    } catch (error) {
      console.error('Error agregando comparable:', error);
      alert(error?.message || 'Error agregando comparable');
    } finally {
      setSavingComparable(false);
    }
  };

  const handleAssignPrice = async () => {
    try {
      if (!precioFinal || Number(precioFinal) <= 0) {
        alert('Ingresa un precio final válido');
        return;
      }

      if (comparables.length < 2) {
        alert('Necesitas al menos 2 comparables para asignar precio');
        return;
      }

      const confirmed = window.confirm(
  `¿Confirmas asignar este precio de venta?\n\nPrecio final: ${formatMoney(precioFinal)}\n\nEsta acción cambiará la unidad a "Precio asignado".`
);

if (!confirmed) return;

setAssigningPrice(true);

const response = await assignInventoryPrice(inventarioId, {
  precioVentaFinal: precioFinal
});

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo asignar el precio');
      }

      if (typeof onPriceAssigned === 'function') {
        await onPriceAssigned();
      }
    } catch (error) {
      console.error('Error asignando precio:', error);
      alert(error?.message || 'Error asignando precio');
    } finally {
      setAssigningPrice(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        Cargando análisis de mercado...
      </div>
    );
  }

  const hasEnoughComparables = comparables.length >= 2;

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div>
          <p style={styles.eyebrow}>Análisis de mercado</p>
          <h2 style={styles.title}>Pricing Inteligente</h2>
          <p style={styles.subtitle}>
            Agrega comparables reales, calcula rangos de precio y asigna un precio de venta justificado.
          </p>
        </div>

        <span
          style={{
            ...styles.validationBadge,
            ...(hasEnoughComparables ? styles.validationOk : styles.validationWarning)
          }}
        >
          {hasEnoughComparables
            ? 'Comparables suficientes'
            : `Faltan ${2 - comparables.length} comparable(s)`}
        </span>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard label="Promedio mercado" value={formatMoney(calculo?.promedioMercado)} />
        <MetricCard label="Precio mínimo" value={formatMoney(calculo?.precioMinimo)} />
        <MetricCard label="Precio sugerido" value={formatMoney(calculo?.precioSugerido)} tone="primary" />
        <MetricCard label="Precio objetivo" value={formatMoney(calculo?.precioObjetivo)} />
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Agregar comparable</h3>
            <p style={styles.sectionText}>
              Captura publicaciones similares del mercado para construir una sugerencia confiable.
            </p>
          </div>
        </div>

        <div style={styles.formGrid}>
          <Field label="Fuente">
            <input
              style={styles.input}
              placeholder="MercadoLibre, Facebook, agencia..."
              value={form.fuente}
              onChange={(e) => handleChange('fuente', e.target.value)}
            />
          </Field>

          <Field label="Precio anunciado">
            <input
              style={styles.input}
              type="number"
              placeholder="Ej. 329000"
              value={form.precio}
              onChange={(e) => handleChange('precio', e.target.value)}
            />
          </Field>

          <Field label="Año">
            <input
              style={styles.input}
              type="number"
              placeholder="Ej. 2022"
              value={form.anio}
              onChange={(e) => handleChange('anio', e.target.value)}
            />
          </Field>

          <Field label="Kilometraje">
            <input
              style={styles.input}
              type="number"
              placeholder="Ej. 45000"
              value={form.km}
              onChange={(e) => handleChange('km', e.target.value)}
            />
          </Field>

          <Field label="Link publicación">
            <input
              style={styles.input}
              placeholder="https://..."
              value={form.link}
              onChange={(e) => handleChange('link', e.target.value)}
            />
          </Field>

          <Field label="Observaciones">
            <input
              style={styles.input}
              placeholder="Versión similar, buen estado, menor km..."
              value={form.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
            />
          </Field>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={handleAddComparable}
          disabled={savingComparable}
        >
          {savingComparable ? 'Agregando...' : 'Agregar comparable'}
        </button>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Comparables registrados</h3>
            <p style={styles.sectionText}>
              Base utilizada para calcular el precio sugerido.
            </p>
          </div>
          <strong style={styles.counter}>{comparables.length}</strong>
        </div>

        {comparables.length === 0 ? (
          <div style={styles.emptyBox}>
            Aún no hay comparables. Agrega mínimo 2 para asignar precio.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fuente</th>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>KM</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {comparables.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{item.fuente || '-'}</strong>
                      {item.link && (
                        <div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.link}
                          >
                            Ver publicación
                          </a>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{item.anio || '-'}</td>
                    <td style={styles.td}>{item.km ? Number(item.km).toLocaleString('es-MX') : '-'}</td>
                    <td style={styles.td}>{formatMoney(item.precio)}</td>
                    <td style={styles.td}>{item.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={styles.assignCard}>
        <div>
          <p style={styles.eyebrow}>Decisión final</p>
          <h3 style={styles.assignTitle}>Asignar precio de venta</h3>
          <p style={styles.sectionText}>
            Usa el precio sugerido o define una estrategia distinta según margen, rotación y condición de la unidad.
          </p>
        </div>

        <div style={styles.assignRow}>
          <input
            style={styles.priceInput}
            type="number"
            placeholder="Precio final"
            value={precioFinal}
            onChange={(e) => setPrecioFinal(e.target.value)}
          />

          <button
            type="button"
            style={{
              ...styles.primaryButton,
              opacity: hasEnoughComparables ? 1 : 0.55,
              cursor: hasEnoughComparables ? 'pointer' : 'not-allowed'
            }}
            disabled={!hasEnoughComparables || assigningPrice}
            onClick={handleAssignPrice}
          >
            {assigningPrice ? 'Asignando...' : 'Asignar precio y avanzar'}
          </button>
        </div>
      </section>
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

function MetricCard({ label, value, tone = 'default' }) {
  return (
    <div
      style={{
        ...styles.metricCard,
        ...(tone === 'primary' ? styles.metricPrimary : {})
      }}
    >
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: '12px'
  },
  loadingBox: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '18px',
    color: '#334155',
    fontWeight: 800
  },
  headerCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start'
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
    margin: '7px 0 0 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.4
  },
  validationBadge: {
    display: 'inline-flex',
    whiteSpace: 'nowrap',
    borderRadius: '999px',
    padding: '7px 10px',
    fontSize: '12px',
    fontWeight: 900,
    border: '1px solid transparent'
  },
  validationOk: {
    background: '#ecfdf5',
    color: '#047857',
    borderColor: '#a7f3d0'
  },
  validationWarning: {
    background: '#fff7ed',
    color: '#c2410c',
    borderColor: '#fed7aa'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  metricCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '13px',
    display: 'grid',
    gap: '5px',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.03)'
  },
  metricPrimary: {
    background: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  metricLabel: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 850
  },
  metricValue: {
    color: '#0f172a',
    fontSize: '17px',
    fontWeight: 950
  },
  section: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px'
  },
  sectionTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 950
  },
  sectionText: {
    margin: '5px 0 0 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.35
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px'
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
    padding: '10px 11px',
    color: '#0f172a',
    background: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '12px 14px',
    fontWeight: 950,
    cursor: 'pointer'
  },
  counter: {
    width: '34px',
    height: '34px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a'
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
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '620px'
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '11px 10px',
    color: '#0f172a',
    fontSize: '13px',
    verticalAlign: 'top'
  },
  link: {
    display: 'inline-block',
    marginTop: '4px',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 800,
    textDecoration: 'none'
  },
  assignCard: {
    background: '#0f172a',
    borderRadius: '20px',
    padding: '16px',
    color: '#ffffff',
    display: 'grid',
    gap: '14px',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.18)'
  },
  assignTitle: {
    margin: '4px 0 0 0',
    fontSize: '18px',
    fontWeight: 950
  },
  assignRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '10px'
  },
  priceInput: {
    width: '100%',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px 14px',
    color: '#ffffff',
    background: '#1e293b',
    fontSize: '15px',
    fontWeight: 900,
    outline: 'none',
    boxSizing: 'border-box'
  },
  primaryButton: {
    border: 'none',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '12px 16px',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }
};