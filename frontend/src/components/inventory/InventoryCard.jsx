const getStatusLabel = (estado) => {
  const map = {
    comprado: 'Comprado',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    publicado: 'Publicado',
    apartado: 'Apartado',
    vendido: 'Vendido'
  };

  return map[estado] || estado || '-';
};

const getStatusColor = (estado) => {
  switch (estado) {
    case 'comprado':
      return {
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe'
      };
    case 'en_preparacion':
      return {
        background: '#fff7ed',
        color: '#c2410c',
        border: '1px solid #fed7aa'
      };
    case 'listo':
      return {
        background: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0'
      };
    case 'publicado':
      return {
        background: '#eef2ff',
        color: '#4338ca',
        border: '1px solid #c7d2fe'
      };
    case 'apartado':
      return {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a'
      };
    case 'vendido':
      return {
        background: '#f3f4f6',
        color: '#111827',
        border: '1px solid #d1d5db'
      };
    default:
      return {
        background: '#f8fafc',
        color: '#334155',
        border: '1px solid #e2e8f0'
      };
  }
};

const getDaysColor = (dias) => {
  if (dias <= 15) {
    return {
      background: '#ecfdf5',
      color: '#047857',
      border: '1px solid #a7f3d0'
    };
  }

  if (dias <= 30) {
    return {
      background: '#fff7ed',
      color: '#c2410c',
      border: '1px solid #fed7aa'
    };
  }

  return {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca'
  };
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

export default function InventoryCard({ item, onClick }) {
  const statusStyle = getStatusColor(item.estado);
  const daysStyle = getDaysColor(Number(item.diasInventario) || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.card}
    >
      <div style={styles.imageWrapper}>
        {item.foto ? (
          <img
            src={item.foto}
            alt={`${item.marca} ${item.submarca}`}
            style={styles.image}
          />
        ) : (
          <div style={styles.imagePlaceholder}>Sin imagen</div>
        )}

        <span style={{ ...styles.statusBadge, ...statusStyle }}>
          {getStatusLabel(item.estado)}
        </span>

        <span style={{ ...styles.daysBadge, ...daysStyle }}>
          {item.diasInventario ?? 0} días
        </span>
      </div>

      <div style={styles.body}>
        <div style={styles.title}>
          {[item.marca, item.submarca, item.version].filter(Boolean).join(' ')}
        </div>

        <div style={styles.meta}>
          <span>{item.anio || '-'}</span>
          <span>•</span>
          <span>{formatNumber(item.km)} km</span>
        </div>

        <div style={styles.folio}>{item.folio || '-'}</div>

        <div style={styles.infoRow}>
          <span style={styles.label}>Compra</span>
          <strong style={styles.value}>{formatMoney(item.precioCompra)}</strong>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.label}>Venta</span>
          <strong style={styles.value}>{formatMoney(item.precioVenta)}</strong>
        </div>
      </div>
    </button>
  );
}

const styles = {
  card: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left'
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '110px',
    background: '#f8fafc'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: '#64748b',
    fontWeight: 700,
    fontSize: '14px'
  },
  statusBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800
  },
  daysBadge: {
    position: 'absolute',
    left: '12px',
    bottom: '12px',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800
  },
  body: {
    padding: '8px'
  },
  title: {
    fontSize: '13px',
    fontWeight: 900,
    color: '#0f172a',
    lineHeight: 1.25
  },
  meta: {
    marginTop: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '13px',
    color: '#64748b'
  },
  folio: {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#334155'
  },
  infoRow: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontSize: '13px',
    color: '#64748b'
  },
  value: {
    fontSize: '14px',
    color: '#111827'
  }
};