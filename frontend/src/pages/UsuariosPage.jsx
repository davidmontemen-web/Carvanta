import { useCallback, useEffect, useMemo, useState } from 'react';
import ModalUsuario from '../components/usuarios/ModalUsuario';
import Button from '../components/ui/Button';
import {
  obtenerUsuarios,
  crearUsuario,
  cambiarEstadoUsuario
} from '../services/usuariosService';
import './UsuariosPage.css';

export default function UsuariosPage() {
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

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerUsuarios();
      setUsuarios(data.usuarios || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        cerrarSesionPorError();
        return;
      }
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

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
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        cerrarSesionPorError();
        return;
      }
      alert(err?.message || 'Error al cambiar estado');
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

      const coincideRol = filtroRol === 'todos' ? true : item.rol === filtroRol;

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
    <div className="usuarios-page">
      <div className="usuarios-actions">
        <Button onClick={() => setModalAbierto(true)}>+ Nuevo usuario</Button>
      </div>

      <div className="usuarios-filters">
        <input
          type="text"
          placeholder="Buscar por id, nombre, apellido o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="ui-input"
        />

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="ui-input"
        >
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="valuador">Valuador</option>
          <option value="tecnico_servicio">Técnico de servicio</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="ui-input"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="usuarios-card">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : error ? (
          <div className="ui-alert-error">{error}</div>
        ) : usuariosFiltrados.length === 0 ? (
          <p>No hay usuarios registrados con esos filtros.</p>
        ) : (
          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th className="usuarios-th">ID</th>
                  <th className="usuarios-th">Nombre completo</th>
                  <th className="usuarios-th">Correo</th>
                  <th className="usuarios-th">Rol</th>
                  <th className="usuarios-th">Estado</th>
                  <th className="usuarios-th">Fecha creación</th>
                  <th className="usuarios-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td className="usuarios-td">{item.id}</td>
                    <td className="usuarios-td">
                      {item.nombre} {item.apellido}
                    </td>
                    <td className="usuarios-td">{item.email}</td>
                    <td className="usuarios-td">
                      <span
                        className={`usuarios-badge ${
                          item.rol === 'administrador'
                            ? 'usuarios-badge-admin'
                            : item.rol === 'tecnico_servicio'
                            ? 'usuarios-badge-tecnico'
                            : 'usuarios-badge-valuador'
                        }`}
                      >
                        {item.rol}
                      </span>
                    </td>
                    <td className="usuarios-td">
                      <span
                        className={`usuarios-badge ${
                          Number(item.activo) === 1
                            ? 'usuarios-badge-activo'
                            : 'usuarios-badge-inactivo'
                        }`}
                      >
                        {Number(item.activo) === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="usuarios-td">{formatearFecha(item.creado_en)}</td>
                    <td className="usuarios-td">
                      <Button
                        className={Number(item.activo) === 1 ? 'usuarios-btn-danger' : 'usuarios-btn-success'}
                        onClick={() => handleCambiarEstado(item)}
                      >
                        {Number(item.activo) === 1 ? 'Inactivar' : 'Activar'}
                      </Button>
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
