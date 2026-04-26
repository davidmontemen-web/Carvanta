import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getReconditioningExpenses,
  addReconditioningExpense,
  deleteReconditioningExpense
} from '../../services/inventoryService';

const categorias = [
  { key: 'mecanica', label: 'Mecánica', desc: 'Motor, frenos, suspensión, fluidos y fallas técnicas.' },
  { key: 'estetica', label: 'Estética', desc: 'Detallado, pintura, interiores, pulido y limpieza.' },
  { key: 'documentacion', label: 'Documentación', desc: 'Gestoría, placas, verificaciones, adeudos o trámites.' },
  { key: 'validacion', label: 'Validación final', desc: 'Prueba de manejo, revisión final y entrega a publicación.' },
  { key: 'otro', label: 'Otro', desc: 'Gastos adicionales no clasificados.' }
];

const formatMoney = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(numeric);
};

export default function ReacondicionamientoView({ inventarioId, onDone, onBack }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('mecanica');
  const [evidencia, setEvidencia] = useState(null);

  const [form, setForm] = useState({
    concepto: '',
    proveedor: '',
    costo: '',
    fecha: '',
    observaciones: ''
  });

  const loadGastos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReconditioningExpenses(inventarioId);

      if (response?.ok) {
        setGastos(response.gastos || []);
      }
    } catch (error) {
      console.error('Error cargando gastos:', error);
      alert('No se pudieron cargar los gastos.');
    } finally {
      setLoading(false);
    }
  }, [inventarioId]);

  useEffect(() => {
    loadGastos();
  }, [loadGastos]);

  const total = useMemo(() => {
    return gastos.reduce((acc, item) => acc + (Number(item.costo) || 0), 0);
  }, [gastos]);

  const hasReconditioningData = gastos.length > 0;

  const totalPorCategoria = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.key] = gastos
        .filter((item) => item.categoria === cat.key)
        .reduce((sum, item) => sum + (Number(item.costo) || 0), 0);

      return acc;
    }, {});
  }, [gastos]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddExpense = async () => {
    try {
      if (!form.concepto || !form.costo) {
        alert('Concepto y costo son obligatorios.');
        return;
      }

      const confirmed = window.confirm(
        `¿Confirmas agregar este gasto?\n\nCategoría: ${selectedCategory}\nConcepto: ${form.concepto}\nCosto: ${formatMoney(form.costo)}`
      );

      if (!confirmed) return;

      setSaving(true);

      const formData = new FormData();
      formData.append('categoria', selectedCategory);
      formData.append('concepto', form.concepto);
      formData.append('proveedor', form.proveedor);
      formData.append('costo', form.costo);
      formData.append('fecha', form.fecha);
      formData.append('observaciones', form.observaciones);

      if (evidencia) {
        formData.append('evidencia', evidencia);
      }

      const response = await addReconditioningExpense(inventarioId, formData);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo agregar el gasto');
      }

      setForm({
        concepto: '',
        proveedor: '',
        costo: '',
        fecha: '',
        observaciones: ''
      });

      setEvidencia(null);

      const fileInput = document.getElementById('reacondicionamiento-evidencia');
      if (fileInput) fileInput.value = '';

      await loadGastos();
    } catch (error) {
      console.error('Error agregando gasto:', error);
      alert(error?.message || 'No se pudo agregar el gasto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (gastoId) => {
    try {
      const confirmed = window.confirm('¿Deseas eliminar este gasto?');

      if (!confirmed) return;

      const response = await deleteReconditioningExpense(inventarioId, gastoId);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo eliminar el gasto');
      }

      await loadGastos();
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert(error?.message || 'No se pudo eliminar el gasto.');
    }
  };

  const handleFinish = async () => {
    if (gastos.length === 0) {
      alert('Agrega al menos un gasto o validación antes de finalizar reacondicionamiento.');
      return;
    }

    const confirmed = window.confirm(
      hasReconditioningData
  ? `Este reacondicionamiento ya tiene información registrada.\n\nCosto total: ${formatMoney(total)}\n\n¿Deseas continuar a Pricing?`
  : `¿Confirmas finalizar reacondicionamiento?\n\nCosto total registrado: ${formatMoney(total)}\n\nDespués podrás continuar con Pricing.`
    );

    if (!confirmed) return;

    if (typeof onDone === 'function') {
      await onDone();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Proceso operativo</p>
          <h2 style={styles.title}>Reacondicionamiento</h2>
          <p style={styles.subtitle}>
            Registra reparaciones, gastos y evidencias para calcular el costo real antes de Pricing.
          </p>
        </div>

        <button type="button" onClick={onBack} style={styles.backButton}>
          ← Volver
        </button>
      </div>

      <section style={styles.totalCard}>
        <div>
          <span style={styles.totalLabel}>Costo acumulado</span>
          <strong style={styles.totalValue}>{formatMoney(total)}</strong>
          <p style={styles.totalText}>
            Este valor alimentará automáticamente el costo de reacondicionamiento en Pricing.
          </p>
        </div>

        <div style={styles.totalCounter}>
          <strong>{gastos.length}</strong>
          <span>movimientos</span>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Categorías de trabajo</h3>

        <div style={styles.categoryGrid}>
          {categorias.map((cat) => {
            const active = selectedCategory === cat.key;
            const categoryTotal = totalPorCategoria[cat.key] || 0;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  ...styles.categoryCard,
                  ...(active ? styles.categoryCardActive : {})
                }}
              >
                <div>
                  <strong style={styles.categoryTitle}>{cat.label}</strong>
                  <p style={styles.categoryDesc}>{cat.desc}</p>
                </div>

                <span style={styles.categoryAmount}>{formatMoney(categoryTotal)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Agregar reparación / gasto</h3>
            <p style={styles.sectionText}>
              Categoría seleccionada:{' '}
              <strong>{categorias.find((cat) => cat.key === selectedCategory)?.label}</strong>
            </p>
          </div>
        </div>

        <div style={styles.formGrid}>
          <Field label="Concepto">
            <input
              style={styles.input}
              placeholder="Ej. Cambio de balatas"
              value={form.concepto}
              onChange={(e) => handleChange('concepto', e.target.value)}
            />
          </Field>

          <Field label="Costo">
            <input
              style={styles.input}
              type="number"
              placeholder="Ej. 2500"
              value={form.costo}
              onChange={(e) => handleChange('costo', e.target.value)}
            />
          </Field>

          <Field label="Proveedor / taller">
            <input
              style={styles.input}
              placeholder="Ej. Taller Los Pinos"
              value={form.proveedor}
              onChange={(e) => handleChange('proveedor', e.target.value)}
            />
          </Field>

          <Field label="Fecha">
            <input
              style={styles.input}
              type="date"
              value={form.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
            />
          </Field>

          <Field label="Observaciones" wide>
            <textarea
              style={styles.textarea}
              placeholder="Describe el trabajo realizado, piezas cambiadas o notas importantes..."
              value={form.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
            />
          </Field>

          <Field label="Factura / evidencia" wide>
            <input
              id="reacondicionamiento-evidencia"
              style={styles.input}
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
            />

            {evidencia && (
              <span style={styles.fileHint}>
                Archivo seleccionado: {evidencia.name}
              </span>
            )}
          </Field>
        </div>

        <button
          type="button"
          style={styles.primaryLightButton}
          onClick={handleAddExpense}
          disabled={saving}
        >
          {saving ? 'Agregando...' : '+ Agregar gasto'}
        </button>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Historial de gastos</h3>
            <p style={styles.sectionText}>
              Registro acumulado de reparaciones y costos del vehículo.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyBox}>Cargando gastos...</div>
        ) : gastos.length === 0 ? (
          <div style={styles.emptyBox}>
            Aún no hay gastos registrados. Agrega reparaciones para alimentar Pricing.
          </div>
        ) : (
          <div style={styles.expenseList}>
            {gastos.map((gasto) => (
              <div key={gasto.id} style={styles.expenseItem}>
                <div>
                  <span style={styles.expenseCategory}>{gasto.categoria}</span>
                  <strong style={styles.expenseConcept}>{gasto.concepto}</strong>
                  <p style={styles.expenseMeta}>
                    {gasto.proveedor || 'Sin proveedor'} · {gasto.fecha || 'Sin fecha'}
                  </p>

                  {gasto.observaciones && (
                    <p style={styles.expenseObs}>{gasto.observaciones}</p>
                  )}

                  {gasto.evidencia_url && (
                    <a
                      href={`http://localhost:4000${gasto.evidencia_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.evidenceLink}
                    >
                      Ver evidencia / factura
                    </a>
                  )}
                </div>

                <div style={styles.expenseRight}>
                  <strong style={styles.expenseCost}>{formatMoney(gasto.costo)}</strong>
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => handleDeleteExpense(gasto.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={styles.actions}>
        <button type="button" onClick={onBack} style={styles.secondaryButton}>
          Volver
        </button>

        <button type="button" onClick={handleFinish} style={styles.primaryButton}>
  {hasReconditioningData ? 'Editar / continuar a Pricing' : 'Finalizar y continuar a Pricing'}
</button>
      </div>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <label style={{ ...styles.field, ...(wide ? styles.fieldWide : {}) }}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  page: { display: 'grid', gap: '14px' },
  header: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '22px',
    padding: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)'
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
  backButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '10px 12px',
    fontWeight: 950,
    cursor: 'pointer'
  },
  totalCard: {
    background: '#0f172a',
    borderRadius: '22px',
    padding: '18px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'center',
    boxShadow: '0 16px 34px rgba(15, 23, 42, 0.22)'
  },
  totalLabel: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 800
  },
  totalValue: {
    display: 'block',
    marginTop: '3px',
    fontSize: '28px',
    fontWeight: 950
  },
  totalText: {
    margin: '5px 0 0 0',
    color: '#cbd5e1',
    fontSize: '12px'
  },
  totalCounter: {
    minWidth: '92px',
    height: '72px',
    borderRadius: '16px',
    background: '#1e293b',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center'
  },
  section: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '22px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)'
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
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  categoryCard: {
    border: '1px solid #dbe4f0',
    background: '#fbfdff',
    borderRadius: '16px',
    padding: '13px',
    display: 'grid',
    gap: '10px',
    textAlign: 'left',
    cursor: 'pointer'
  },
  categoryCardActive: {
    background: '#eff6ff',
    borderColor: '#93c5fd',
    boxShadow: '0 10px 22px rgba(37, 99, 235, 0.12)'
  },
  categoryTitle: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 950
  },
  categoryDesc: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.3
  },
  categoryAmount: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 950
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
  fieldWide: {
    gridColumn: '1 / -1'
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
  textarea: {
    width: '100%',
    minHeight: '82px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '10px 11px',
    color: '#0f172a',
    background: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  fileHint: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800
  },
  primaryLightButton: {
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '12px 14px',
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)'
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
  expenseList: {
    display: 'grid',
    gap: '10px'
  },
  expenseItem: {
    border: '1px solid #dbe4f0',
    background: '#fbfdff',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)'
  },
  expenseCategory: {
    display: 'inline-flex',
    marginBottom: '6px',
    padding: '4px 8px',
    borderRadius: '999px',
    background: '#e0f2fe',
    color: '#0369a1',
    fontSize: '11px',
    fontWeight: 900
  },
  expenseConcept: {
    display: 'block',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 950
  },
  expenseMeta: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '12px'
  },
  expenseObs: {
    margin: '6px 0 0 0',
    color: '#334155',
    fontSize: '12px',
    lineHeight: 1.35
  },
  evidenceLink: {
    display: 'inline-block',
    marginTop: '8px',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 900,
    textDecoration: 'none'
  },
  expenseRight: {
    display: 'grid',
    gap: '8px',
    justifyItems: 'end',
    alignContent: 'start'
  },
  expenseCost: {
    color: '#0f172a',
    fontSize: '15px',
    fontWeight: 950
  },
  deleteButton: {
    border: '1px solid #fca5a5',
    background: '#fff5f5',
    color: '#b91c1c',
    borderRadius: '10px',
    padding: '7px 9px',
    fontSize: '12px',
    fontWeight: 900,
    cursor: 'pointer'
  },
  actions: {
    position: 'sticky',
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(248,250,252,0.35), #f8fafc 48%)',
    paddingTop: '14px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
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
    padding: '13px 14px',
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)'
  }
};
