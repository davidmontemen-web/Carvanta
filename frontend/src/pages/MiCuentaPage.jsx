export default function MiCuentaPage({ usuario }) {
  return (
    <div style={styles.card}>
      <h2>Mi cuenta</h2>

      <div style={styles.grid}>
        <div>
          <strong>Nombre:</strong>
          <p>{usuario?.nombre} {usuario?.apellido}</p>
        </div>

        <div>
          <strong>Correo:</strong>
          <p>{usuario?.email}</p>
        </div>

        <div>
          <strong>Rol:</strong>
          <p>{usuario?.rol}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  }
};