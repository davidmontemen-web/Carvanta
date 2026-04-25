import { useEffect, useMemo, useState } from 'react';
import { getInventory } from '../services/inventoryService';
import InventoryCard from '../components/inventory/InventoryCard';
import InventoryDetailDrawer from '../components/inventory/InventoryDetailDrawer';

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

const getDaysTone = (days) => {
  if (days <= 15) return styles.daysGood;
  if (days <= 30) return styles.daysWarning;
  return styles.daysDanger;
};

const getStatusLabel = (status) => {
  const map = {
    comprado: 'Comprado',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    publicado: 'Publicado',
    apartado: 'Apartado',
    vendido: 'Vendido'
  };

  return map[status] || status || '-';
};

const getStatusStyle = (status) => {
  const map = {
    comprado: styles.statusBought,
    en_preparacion: styles.statusPreparing,
    listo: styles.statusReady,
    publicado: styles.statusPublished,
    apartado: styles.statusReserved,
    vendido: styles.statusSold
  };

  return map[status] || styles.statusDefault;
};

export default function InventarioPage() {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    loadInventory();
  }, []);

    const loadInventory = async (selectedInventoryId = null) => {
  try {
    setLoading(true);
    setError('');

    const response = await getInventory();

    if (!response?.ok) {
      throw new Error('No se pudo obtener inventario');
    }

    const updatedInventory = response.data || [];
    setInventory(updatedInventory);

    if (selectedInventoryId) {
      const updatedSelected = updatedInventory.find(
        (item) => Number(item.id) === Number(selectedInventoryId)
      );

      if (updatedSelected) {
        setSelectedItem(updatedSelected);
      }
    }
  } catch (err) {
    console.error('Error al cargar inventario:', err);
    setError(err?.message || 'No se pudo cargar el inventario');
  } finally {
    setLoading(false);
  }
};

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setOpenDrawer(true);
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(item.folio || '').toLowerCase().includes(searchText) ||
        String(item.marca || '').toLowerCase().includes(searchText) ||
        String(item.submarca || '').toLowerCase().includes(searchText) ||
        String(item.version || '').toLowerCase().includes(searchText) ||
        String(item.anio || '').toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'todos' || item.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const summary = useMemo(() => {
    const total = inventory.length;
    const valorCompra = inventory.reduce(
      (acc, item) => acc + (Number(item.precioCompra) || 0),
      0
    );
    const valorVenta = inventory.reduce(
      (acc, item) => acc + (Number(item.precioVenta) || 0),
      0
    );
    const enRiesgo = inventory.filter((item) => Number(item.diasInventario) > 30).length;

    return {
      total,
      valorCompra,
      valorVenta,
      enRiesgo
    };
  }, [inventory]);

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div>
          <p style={styles.heroEyebrow}>Control operativo</p>
          <h2 style={styles.heroTitle}>Inventario de seminuevos</h2>
          <p style={styles.heroSubtitle}>
            Visualiza las unidades compradas, su valor actual, rotación y estado operativo.
          </p>
        </div>

        <div style={styles.heroActions}>
          <button style={styles.secondaryButton} onClick={loadInventory}>
            Actualizar
          </button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <KpiCard
          label="Unidades"
          value={summary.total}
          subtitle="Total en inventario"
          tone="default"
        />
        <KpiCard
          label="Valor compra"
          value={formatMoney(summary.valorCompra)}
          subtitle="Costo total invertido"
          tone="info"
        />
        <KpiCard
          label="Valor venta"
          value={formatMoney(summary.valorVenta)}
          subtitle="Precio proyectado de salida"
          tone="success"
        />
        <KpiCard
          label="En riesgo"
          value={summary.enRiesgo}
          subtitle="Más de 30 días en inventario"
          tone="danger"
        />
      </div>

      <div style={styles.controlCard}>
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por folio, marca, submarca, versión o año"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="todos">Todos los estados</option>
            <option value="comprado">Comprado</option>
            <option value="en_preparacion">En preparación</option>
            <option value="listo">Listo</option>
            <option value="publicado">Publicado</option>
            <option value="apartado">Apartado</option>
            <option value="vendido">Vendido</option>
          </select>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => {
              setSearch('');
              setStatusFilter('todos');
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loadingBox}>Cargando inventario...</div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : filteredInventory.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No hay unidades en inventario</h3>
            <p style={styles.emptyText}>
              Cuando un avalúo se marque como comprado, aparecerá aquí automáticamente.
            </p>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredInventory.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onClick={() => handleOpenDetail(item)}
              />
            ))}
          </div>
        )}
      </div>
      <InventoryDetailDrawer
  open={openDrawer}
  item={selectedItem}
  onClose={() => setOpenDrawer(false)}
  onUpdated={() => loadInventory(selectedItem?.id)}
/>
    </div>
  );
}

function KpiCard({ label, value, subtitle, tone = 'default' }) {
  const toneStyle = {
    default: styles.kpiDefault,
    info: styles.kpiInfo,
    success: styles.kpiSuccess,
    danger: styles.kpiDanger
  }[tone] || styles.kpiDefault;

  return (
    <div style={{ ...styles.kpiCard, ...toneStyle }}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiSubtitle}>{subtitle}</div>
      
    </div>
    
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: '14px',
    paddingBottom: '10px'
  },

  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
  },
  heroEyebrow: {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#0f172a',
    margin: 0
  },
  heroTitle: {
    margin: '4px 0 0 0',
    fontSize: '28px',
    fontWeight: 900,
    color: '#0f172a'
  },
  heroSubtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '13px',
    maxWidth: '760px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '10px 12px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer'
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px'
  },
  kpiCard: {
    borderRadius: '14px',
    padding: '14px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1
  },
  kpiLabel: {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#111827'
  },
  kpiSubtitle: {
    marginTop: '4px',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: 1.35
  },
  kpiDefault: {
    background: '#ffffff',
    border: '1px solid #e5e7eb'
  },
  kpiInfo: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe'
  },
  kpiSuccess: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0'
  },
  kpiDanger: {
    background: '#fef2f2',
    border: '1px solid #fecaca'
  },

  controlCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    flex: '1 1 280px',
    minWidth: '240px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    padding: '10px 12px',
    fontSize: '13px',
    outline: 'none',
    background: '#fff'
  },
  select: {
    minWidth: '190px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    padding: '10px 12px',
    fontSize: '13px',
    background: '#fff',
    outline: 'none'
  },

  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
  },
  loadingBox: {
    padding: '18px',
    borderRadius: '12px',
    background: '#f8fafc',
    color: '#334155',
    fontWeight: 600
  },
  errorBox: {
    padding: '18px',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#991b1b',
    fontWeight: 700
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center'
  },
  emptyTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#111827'
  },
  emptyText: {
    margin: '8px 0 0 0',
    color: '#64748b'
  },

  tableWrapper: {
    overflowX: 'auto'
  },
    cardsGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
  gap: '10px'
},
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '980px'
  },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#64748b',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 800
  },
  tr: {
    borderBottom: '1px solid #eef2f7'
  },
  td: {
    padding: '14px 10px',
    fontSize: '13px',
    color: '#111827',
    verticalAlign: 'middle'
  },
  primaryCell: {
    display: 'grid',
    gap: '4px'
  },
  primaryLine: {
    color: '#0f172a',
    fontWeight: 800
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid transparent'
  },
  statusDefault: {
    background: '#f8fafc',
    color: '#334155',
    borderColor: '#e2e8f0'
  },
  statusBought: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderColor: '#bfdbfe'
  },
  statusPreparing: {
    background: '#fff7ed',
    color: '#c2410c',
    borderColor: '#fed7aa'
  },
  statusReady: {
    background: '#ecfdf5',
    color: '#047857',
    borderColor: '#a7f3d0'
  },
  statusPublished: {
    background: '#eef2ff',
    color: '#4338ca',
    borderColor: '#c7d2fe'
  },
  statusReserved: {
    background: '#fef3c7',
    color: '#92400e',
    borderColor: '#fde68a'
  },
  statusSold: {
    background: '#f3f4f6',
    color: '#111827',
    borderColor: '#d1d5db'
  },

  daysBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid transparent'
  },
  daysGood: {
    background: '#ecfdf5',
    color: '#047857',
    borderColor: '#a7f3d0'
  },
  daysWarning: {
    background: '#fff7ed',
    color: '#c2410c',
    borderColor: '#fed7aa'
  },
  daysDanger: {
    background: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fecaca'
  }
};