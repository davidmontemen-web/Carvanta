import { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Debes capturar correo y contraseña');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });

      const { token, usuario } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      onLogin(usuario);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Carvanta</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="correo@carvanta.com"
            />
          </div>

          <div>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="********"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f3f4f6',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },
  title: {
    margin: 0,
    marginBottom: '8px',
    fontSize: '32px',
    color: '#111827'
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '24px',
    color: '#6b7280'
  },
  form: {
    display: 'grid',
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
    padding: '12px',
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '10px'
  },
  button: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    cursor: 'pointer',
    fontWeight: 600
  }
};