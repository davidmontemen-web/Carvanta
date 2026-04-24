import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout({
  usuario,
  onLogout,
  vistaActiva,
  onCambiarVista,
  tituloVista,
  children
}) {
  return (
    <div style={styles.appShell}>
      <Sidebar
        usuario={usuario}
        vistaActiva={vistaActiva}
        onCambiarVista={onCambiarVista}
      />

      <main style={styles.main}>
        <Topbar
          usuario={usuario}
          onLogout={onLogout}
          tituloVista={tituloVista}
        />

        <div style={styles.contentViewport}>
          <div style={styles.contentInner}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#eef2f7'
  },

  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#f4f6f8'
  },

  contentViewport: {
    flex: 1,
    minHeight: 0,
    padding: '0 18px 18px',
    boxSizing: 'border-box'
  },

  contentInner: {
    minHeight: '100%',
    display: 'grid',
    alignContent: 'start',
    gap: '14px'
  }
};