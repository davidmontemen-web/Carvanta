import { useState } from 'react';

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'valuador'
};

export default function ModalUsuario({ abierto, onClose, onGuardar }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!abierto) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.rol) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      await onGuardar(form);
      setForm(initialForm);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setForm(initialForm);
    setError('');
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Nuevo usuario</h2>
          <button onClick={handleCerrar} style={styles.closeButton}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Correo</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Rol</label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="valuador">Valuador</option>
                <option value="tecnico_servicio">Técnico de servicio</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={handleCerrar} style={styles.secondaryButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={styles.primaryButton}>
              {loading ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '700px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '20px',
    cursor: 'pointer'
  },
  form: {
    padding: '24px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  error: {
    marginTop: '16px',
    padding: '12px',
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '10px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  secondaryButton: {
    padding: '12px 18px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer'
  },
  primaryButton: {
    padding: '12px 18px',
    borderRadius: '10px',
    border: 'none',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer'
  }
};
