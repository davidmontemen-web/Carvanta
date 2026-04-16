export default function Topbar({ usuario, onLogout, tituloVista }) {
  return (
    <header style={styles.topbar}>
      <div>
        <h1 style={styles.title}>{tituloVista}</h1>
        <p style={styles.subtitle}>Base operativa de Carvanta</p>
      </div>

      <div style={styles.userBox}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <span style={styles.userMeta}>
            {usuario?.rol} · {usuario?.email}
          </span>
        </div>

        <button style={styles.logoutButton} onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    background: '#fff',
    borderRadius: '18px',
    padding: '18px 22px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#111827'
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: '#6b7280',
    fontSize: '14px'
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userName: {
    fontWeight: 700,
    color: '#111827'
  },
  userMeta: {
    color: '#6b7280',
    fontSize: '13px'
  },
  logoutButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 600
  }
};