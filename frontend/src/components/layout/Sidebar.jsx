export default function Sidebar({ usuario, vistaActiva, onCambiarVista }) {
  const esAdmin = usuario?.rol === 'administrador';

  const menu = [
    { key: 'dashboard', label: 'Dashboard', visible: true },
    { key: 'avaluos', label: 'Avalúos', visible: true },
    { key: 'ventas', label: 'Ventas', visible: esAdmin },
    { key: 'inventario', label: 'Inventario', visible: esAdmin },
    { key: 'usuarios', label: 'Usuarios', visible: esAdmin },
    { key: 'mi-cuenta', label: 'Mi cuenta', visible: true }
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoBox}>
        <h2 style={styles.logo}>Carvanta</h2>
        <p style={styles.logoSub}>
          {esAdmin ? 'Panel administrador' : 'Panel valuador'}
        </p>
      </div>

      <nav style={styles.nav}>
        {menu
          .filter((item) => item.visible)
          .map((item) => {
            const activo = vistaActiva === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onCambiarVista(item.key)}
                style={{
                  ...styles.navButton,
                  ...(activo ? styles.navButtonActive : {})
                }}
              >
                {item.label}
              </button>
            );
          })}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: '#111827',
    color: '#fff',
    padding: '24px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  logoBox: {
    paddingBottom: '18px',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700
  },
  logoSub: {
    marginTop: '8px',
    marginBottom: 0,
    color: '#9ca3af',
    fontSize: '14px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  navButton: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    color: '#e5e7eb',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px'
  },
  navButtonActive: {
    background: '#1f2937',
    color: '#fff'
  }
};