import { useEffect, useState } from 'react';
import {
  getPublicationChannelsConfig,
  savePublicationChannelConfig
} from '../services/inventoryService';

const CHANNEL_LABELS = {
  mercadolibre: 'MercadoLibre',
  seminuevos: 'Seminuevos',
  autocosmos: 'Autocosmos',
  facebook: 'Facebook Marketplace'
};

export default function PublicacionCanalesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3600);
    return () => clearTimeout(timer);
  }, [notification]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await getPublicationChannelsConfig();

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo cargar la configuración');
      }

      const mapped = (response.canales || []).map((channel) => ({
        canal: channel.canal,
        provider: channel.provider || 'webhook',
        activo: Boolean(channel.activo),
        webhookUrl: channel.webhookUrl || '',
        profileUrl: channel.profileUrl || '',
        apiKey: ''
      }));

      setChannels(mapped);
    } catch (error) {
      console.error('Error cargando configuración de canales:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo cargar la configuración de canales.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const updateChannelField = (canal, field, value) => {
    setChannels((prev) =>
      prev.map((item) =>
        item.canal === canal
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const handleSave = async (channel) => {
    try {
      setSaving(true);

      const response = await savePublicationChannelConfig({
        canal: channel.canal,
        provider: channel.provider,
        activo: channel.activo,
        webhookUrl: channel.webhookUrl,
        apiKey: channel.apiKey,
        profileUrl: channel.profileUrl
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo guardar');
      }

      setNotification({
        type: 'success',
        message: `Configuración guardada para ${CHANNEL_LABELS[channel.canal] || channel.canal}.`
      });

      await loadConfig();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo guardar configuración.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h2 style={styles.title}>Configuración de canales de publicación</h2>
        <p style={styles.subtitle}>
          Aquí definimos la conexión técnica por canal y el usuario solo debe actualizar su link de perfil/publicación.
        </p>

        {notification && (
          <div
            style={{
              ...styles.notification,
              ...(notification.type === 'success' ? styles.notificationSuccess : styles.notificationError)
            }}
          >
            {notification.message}
          </div>
        )}
      </section>

      {loading ? (
        <div style={styles.card}>Cargando configuración...</div>
      ) : (
        channels.map((channel) => (
          <section key={channel.canal} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.channelTitle}>{CHANNEL_LABELS[channel.canal] || channel.canal}</h3>
                <p style={styles.channelSubtitle}>Configura conexión interna + link visible para el usuario.</p>
              </div>

              <label style={styles.switchRow}>
                <input
                  type="checkbox"
                  checked={Boolean(channel.activo)}
                  onChange={(e) => updateChannelField(channel.canal, 'activo', e.target.checked)}
                />
                Canal activo
              </label>
            </div>

            <div style={styles.grid}>
              <Field label="Tipo de integración">
                <select
                  style={styles.input}
                  value={channel.provider}
                  onChange={(e) => updateChannelField(channel.canal, 'provider', e.target.value)}
                >
                  <option value="webhook">Webhook/API</option>
                  <option value="profile_link_only">Solo link de perfil</option>
                </select>
              </Field>

              <Field label="Link de perfil/publicación (usuario)">
                <input
                  style={styles.input}
                  placeholder="https://..."
                  value={channel.profileUrl}
                  onChange={(e) => updateChannelField(channel.canal, 'profileUrl', e.target.value)}
                />
              </Field>

              <Field label="Webhook interno (admin)">
                <input
                  style={styles.input}
                  placeholder="https://api.tu-provider.com/publish"
                  value={channel.webhookUrl}
                  onChange={(e) => updateChannelField(channel.canal, 'webhookUrl', e.target.value)}
                  disabled={channel.provider === 'profile_link_only'}
                />
              </Field>

              <Field label="API Key / Token (admin)">
                <input
                  style={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={channel.apiKey}
                  onChange={(e) => updateChannelField(channel.canal, 'apiKey', e.target.value)}
                  disabled={channel.provider === 'profile_link_only'}
                />
              </Field>
            </div>

            <button type="button" style={styles.primaryButton} onClick={() => handleSave(channel)} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar canal'}
            </button>
          </section>
        ))
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: '12px'
  },
  hero: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '18px',
    padding: '16px'
  },
  title: {
    margin: 0,
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: 900
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '13px'
  },
  notification: {
    marginTop: '10px',
    border: '1px solid transparent',
    borderRadius: '10px',
    padding: '8px 10px',
    fontSize: '12px',
    fontWeight: 800
  },
  notificationSuccess: {
    background: '#ecfdf5',
    color: '#166534',
    borderColor: '#86efac'
  },
  notificationError: {
    background: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '18px',
    padding: '16px',
    display: 'grid',
    gap: '10px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start'
  },
  channelTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 900
  },
  channelSubtitle: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '12px'
  },
  switchRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    color: '#334155',
    fontSize: '12px',
    fontWeight: 800
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  field: {
    display: 'grid',
    gap: '6px'
  },
  label: {
    color: '#475569',
    fontSize: '12px',
    fontWeight: 800
  },
  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '10px 11px',
    boxSizing: 'border-box'
  },
  primaryButton: {
    justifySelf: 'start',
    border: 'none',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontWeight: 900,
    cursor: 'pointer'
  }
};
