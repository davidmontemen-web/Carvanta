export default function Sidebar({ usuario, vistaActiva, onCambiarVista }) {
  const esAdmin = usuario?.rol === 'administrador';

  const menuPrincipal = [
    { key: 'dashboard', label: 'Dashboard', visible: true },
    { key: 'avaluos', label: 'Avalúos', visible: true },
    { key: 'ventas', label: 'Ventas', visible: esAdmin },
    { key: 'inventario', label: 'Inventario', visible: esAdmin },
    { key: 'publicacion-config', label: 'Config publicación', visible: esAdmin },
    { key: 'usuarios', label: 'Usuarios', visible: esAdmin }
  ];

  const nombreCompleto =
    [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Mi cuenta';

  const inicial = (usuario?.nombre?.[0] || usuario?.apellido?.[0] || 'U').toUpperCase();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.topBlock}>
        <div style={styles.brandCard}>
          <div style={styles.brandMark}>C</div>

          <div style={styles.brandText}>
            <h2 style={styles.logo}>Carvanta</h2>
            <p style={styles.logoSub}>Plataforma operativa</p>
          </div>
        </div>
      </div>

      <nav style={styles.nav}>
        <div style={styles.navHeader}>Navegación</div>

        {menuPrincipal
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
                <span style={styles.navButtonText}>{item.label}</span>
                {activo && <span style={styles.activeDot} />}
              </button>
            );
          })}
      </nav>

      <div style={styles.bottomBlock}>
        <button
          onClick={() => onCambiarVista('mi-cuenta')}
          style={{
            ...styles.accountCard,
            ...(vistaActiva === 'mi-cuenta' ? styles.accountCardActive : {})
          }}
        >
          <div style={styles.accountAvatar}>{inicial}</div>

          <div style={styles.accountInfo}>
            <span style={styles.accountLabel}>Mi cuenta</span>
            <strong style={styles.accountName}>{nombreCompleto}</strong>
          </div>

          <span style={styles.accountArrow}>›</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '270px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    background: '#0f172a',
    color: '#ffffff',
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    boxSizing: 'border-box'
  },

  topBlock: {
    display: 'grid',
    gap: '12px'
  },

  brandCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    borderRadius: '16px',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
    border: '1px solid rgba(255,255,255,0.08)'
  },

  brandMark: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#ffffff',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 900,
    flexShrink: 0
  },

  brandText: {
    display: 'grid',
    gap: '2px'
  },

  logo: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#ffffff'
  },

  logoSub: {
    margin: 0,
    color: 'rgba(255,255,255,0.68)',
    fontSize: '12px',
    fontWeight: 500
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minHeight: 0
  },

  navHeader: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 800,
    padding: '4px 4px 8px'
  },

  navButton: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    color: 'rgba(255,255,255,0.82)',
    border: '1px solid transparent',
    borderRadius: '14px',
    padding: '12px 14px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease'
  },

  navButtonActive: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #ffffff',
    boxShadow: '0 10px 24px rgba(0,0,0,0.18)'
  },

  navButtonText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },

  activeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    background: '#0f172a',
    flexShrink: 0
  },

  bottomBlock: {
    paddingTop: '8px',
    borderTop: '1px solid rgba(255,255,255,0.08)'
  },

  accountCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '12px',
    cursor: 'pointer',
    color: '#ffffff',
    textAlign: 'left'
  },

  accountCardActive: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #ffffff',
    boxShadow: '0 10px 24px rgba(0,0,0,0.18)'
  },

  accountAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: 900,
    flexShrink: 0
  },

  accountInfo: {
    display: 'grid',
    gap: '2px',
    flex: 1,
    minWidth: 0
  },

  accountLabel: {
    fontSize: '11px',
    color: 'inherit',
    opacity: 0.7,
    fontWeight: 700
  },

  accountName: {
    fontSize: '13px',
    color: 'inherit',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  accountArrow: {
    fontSize: '22px',
    lineHeight: 1,
    opacity: 0.75,
    flexShrink: 0
  }
};
