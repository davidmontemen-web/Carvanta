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
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBlock}>
            <div style={styles.brandBadge}>CARVANTA</div>
            <h1 style={styles.brandTitle}>Opera, avalúa y decide con velocidad.</h1>
            <p style={styles.brandText}>
              Plataforma pensada para equipos comerciales y operación de seminuevos,
              con enfoque en seguimiento, control y ejecución.
            </p>
          </div>

          <div style={styles.valueGrid}>
            <div style={styles.valueCard}>
              <span style={styles.valueNumber}>01</span>
              <div>
                <strong style={styles.valueTitle}>Control comercial</strong>
                <p style={styles.valueText}>
                  Da seguimiento claro a cada avalúo y a cada oportunidad de compra.
                </p>
              </div>
            </div>

            <div style={styles.valueCard}>
              <span style={styles.valueNumber}>02</span>
              <div>
                <strong style={styles.valueTitle}>Operación en campo</strong>
                <p style={styles.valueText}>
                  Captura datos y fotos desde el punto de inspección con orden y velocidad.
                </p>
              </div>
            </div>

            <div style={styles.valueCard}>
              <span style={styles.valueNumber}>03</span>
              <div>
                <strong style={styles.valueTitle}>Decisión ejecutiva</strong>
                <p style={styles.valueText}>
                  Convierte el trabajo operativo en información útil para vender y comprar mejor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.formBrandRow}>
                <div style={styles.formBrandIcon}>C</div>
                <div>
                  <h2 style={styles.formTitle}>Iniciar sesión</h2>
                  <p style={styles.formSubtitle}>Accede a tu entorno de trabajo</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="correo@carvanta.com"
                  autoComplete="username"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.actionBlock}>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Entrar al sistema'}
                </Button>
              </div>
            </form>

            <div style={styles.footerNote}>
              <span style={styles.footerLine} />
              <span style={styles.footerText}>Acceso seguro para operación comercial</span>
              <span style={styles.footerLine} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e9edf2 0%, #f6f8fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    boxSizing: 'border-box'
  },

  shell: {
    width: '100%',
    maxWidth: '1320px',
    minHeight: '760px',
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    background: '#ffffff',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
    border: '1px solid #dde3ea'
  },

  leftPanel: {
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#ffffff',
    padding: '52px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '32px',
    position: 'relative'
  },

  brandBlock: {
    maxWidth: '560px'
  },

  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.10)',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '24px'
  },

  brandTitle: {
    margin: 0,
    fontSize: '46px',
    lineHeight: 1.02,
    letterSpacing: '-0.04em',
    fontWeight: 800,
    maxWidth: '620px'
  },

  brandText: {
    margin: '20px 0 0 0',
    maxWidth: '520px',
    fontSize: '17px',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.72)'
  },

  valueGrid: {
    display: 'grid',
    gap: '16px',
    maxWidth: '560px'
  },

  valueCard: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr',
    gap: '16px',
    alignItems: 'start',
    padding: '18px 18px 18px 16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)'
  },

  valueNumber: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: '#ffffff',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '14px'
  },

  valueTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '6px'
  },

  valueText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.68)'
  },

  rightPanel: {
    background: '#f8fafc',
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  formCard: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '34px 32px',
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
    border: '1px solid #e5e7eb'
  },

  formHeader: {
    marginBottom: '26px'
  },

  formBrandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  formBrandIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '16px',
    background: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '18px',
    flexShrink: 0
  },

  formTitle: {
    margin: 0,
    fontSize: '28px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.03em'
  },

  formSubtitle: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '14px'
  },

  form: {
    display: 'grid',
    gap: '18px'
  },

  field: {
    display: 'grid',
    gap: '8px'
  },

  label: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#334155'
  },

  input: {
    width: '100%',
    height: '50px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    padding: '0 16px',
    fontSize: '15px',
    color: '#0f172a',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none'
  },

  errorBox: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: 700
  },

  actionBlock: {
    paddingTop: '6px'
  },

  footerNote: {
    marginTop: '26px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  footerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb'
  },

  footerText: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap'
  }
};