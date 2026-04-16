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
    <div style={styles.container}>
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

        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f3f4f6'
  },
  main: {
    flex: 1,
    padding: '24px'
  },
  content: {
    minHeight: 'calc(100vh - 120px)'
  }
};