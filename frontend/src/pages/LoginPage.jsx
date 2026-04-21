import { useState } from 'react';
import httpClient from '../services/httpClient';
import Button from '../components/ui/Button';

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

      const res = await httpClient.post('/api/auth/login', {
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
    <div className="page-center">
      <div className="ui-card">
        <h1 className="ui-title">Carvanta</h1>
        <p className="ui-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="ui-form">
          <div>
            <label className="ui-label">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ui-input"
              placeholder="correo@carvanta.com"
            />
          </div>

          <div>
            <label className="ui-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ui-input"
              placeholder="********"
            />
          </div>

          {error && <div className="ui-alert-error">{error}</div>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}