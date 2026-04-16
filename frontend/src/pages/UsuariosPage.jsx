import { useEffect, useMemo, useState } from 'react';
import ModalUsuario from '../components/usuarios/ModalUsuario';
import {
  obtenerUsuarios,
  crearUsuario,
  cambiarEstadoUsuario
} from '../services/usuariosService';

export default function UsuariosPage({ onLogout, usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const cerrarSesionPorError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerUsuarios();
      setUsuarios(data.usuarios || []);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        cerrarSesionPorError();
        return;
      }
      setError(err?.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleGuardarUsuario = async (formData) => {
    await crearUsuario(formData);
    await cargarUsuarios();
  };

  const handleCambiarEstado = async (item) => {
    const nuevoEstado = item.activo ? 0 : 1;

    try {
      await cambiarEstadoUsuario(item.id, nuevoEstado);
      await cargarUsuarios();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        cerrarSesionPorError();
        return;
      }
      alert(err?.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-MX');
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((item) => {
      const texto = `${item.id} ${item.nombre} ${item.apellido} ${item.email}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideRol =
        filtroRol === 'todos' ? true : item.rol === filtroRol;

      const coincideEstado =
        filtroEstado === 'todos'
          ? true
          : filtroEstado === 'activo'
          ? Number(item.activo) === 1
          : Number(item.activo) === 0;

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  return (
    <div style={styles.page}>
      <div style={styles.actionsBar}>
  <button style={styles.newButton} onClick={() => setModalAbierto(true)}>
    + Nuevo usuario
  </button>
</div>

      <div style={styles.filtersCard}>
        <input
          type="text"
          placeholder="Buscar por id, nombre, apellido o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="valuador">Valuador</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : usuariosFiltrados.length === 0 ? (
          <p>No hay usuarios registrados con esos filtros.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Nombre completo</th>
                  <th style={styles.th}>Correo</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Fecha creación</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.id}</td>
                    <td style={styles.td}>
                      {item.nombre} {item.apellido}
                    </td>
                    <td style={styles.td}>{item.email}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(item.rol === 'administrador'
                            ? styles.badgeAdmin
                            : styles.badgeValuador)
                        }}
                      >
                        {item.rol}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(Number(item.activo) === 1
                            ? styles.badgeActivo
                            : styles.badgeInactivo)
                        }}
                      >
                        {Number(item.activo) === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={styles.td}>{formatearFecha(item.creado_en)}</td>
                    <td style={styles.td}>
                      <button
                        style={Number(item.activo) === 1 ? styles.dangerButton : styles.successButton}
                        onClick={() => handleCambiarEstado(item)}
                      >
                        {Number(item.activo) === 1 ? 'Inactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalUsuario
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardar={handleGuardarUsuario}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: '32px'
  },

  actionsBar: {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '20px'
},
  
  logoutButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    padding: '12px 18px',
    cursor: 'pointer',
    fontWeight: 600
  },
  newButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    cursor: 'pointer',
    fontWeight: 600
  },
  filtersCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '12px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#fff'
  },
  card: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
  },
  errorBox: {
    padding: '14px',
    borderRadius: '10px',
    background: '#fee2e2',
    color: '#b91c1c'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    fontSize: '14px'
  },
  td: {
    padding: '14px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
    color: '#111827'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'capitalize'
  },
  badgeAdmin: {
    background: '#dbeafe',
    color: '#1d4ed8'
  },
  badgeValuador: {
    background: '#ede9fe',
    color: '#6d28d9'
  },
  badgeActivo: {
    background: '#dcfce7',
    color: '#166534'
  },
  badgeInactivo: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  dangerButton: {
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer'
  },
  successButton: {
    background: '#166534',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer'
  }
};

