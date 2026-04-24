export default function Topbar({ usuario, onLogout, tituloVista }) {
  const nombreCompleto =
    [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Usuario';

  const rolLabel = usuario?.rol === 'administrador' ? 'Administrador' : usuario?.rol || 'Usuario';
  const inicial = (usuario?.nombre?.[0] || usuario?.apellido?.[0] || 'U').toUpperCase();

  return (
    <header style={styles.wrapper}>
      <div style={styles.leftBlock}>
        <div style={styles.titleGroup}>
          <span style={styles.eyebrow}>Carvanta</span>
          <h1 style={styles.title}>{tituloVista}</h1>
        </div>
      </div>

      <div style={styles.rightBlock}>
        <div style={styles.userBlock}>
          <div style={styles.avatar}>{inicial}</div>

          <div style={styles.userInfo}>
            <span style={styles.userName}>{nombreCompleto}</span>
            <span style={styles.userMeta}>{rolLabel}</span>
          </div>
        </div>

        <button style={styles.logoutButton} onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

const styles = {
  wrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '0 22px',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    boxSizing: 'border-box',
    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.18)',
    marginBottom: '16px'
  },

  leftBlock: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0
  },

  titleGroup: {
    display: 'grid',
    gap: '2px',
    minWidth: 0
  },

  eyebrow: {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 1
  },

  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  rightBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },

  userBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 10px 6px 6px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(6px)'
  },

  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '999px',
    background: '#ffffff',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 900,
    flexShrink: 0
  },

  userInfo: {
    display: 'grid',
    gap: '1px',
    minWidth: 0
  },

  userName: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '170px'
  },

  userMeta: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.64)',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '170px'
  },

  logoutButton: {
    height: '36px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer'
  }
};