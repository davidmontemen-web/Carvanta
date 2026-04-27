import { useEffect, useMemo, useState } from 'react';
import {
  getInventoryPublications,
  getPublicationChannelsConfig,
  publishInventory,
  retryInventoryPublication,
  savePublicationChannelConfig,
  updateInventoryPublicationStatus
} from '../../services/inventoryService';

const CHANNEL_LABELS = {
  mercadolibre: 'MercadoLibre',
  seminuevos: 'Seminuevos',
  autocosmos: 'Autocosmos',
  facebook: 'Facebook Marketplace'
};

const statusStyles = {
  published: { background: '#dcfce7', color: '#166534', borderColor: '#86efac' },
  failed: { background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' },
  paused: { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
  draft: { background: '#e2e8f0', color: '#334155', borderColor: '#cbd5e1' },
  queued: { background: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' }
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-MX');
};

export default function PublicacionView({ inventarioId, mode, onPublished }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [form, setForm] = useState({ titulo: '', descripcion: '' });
  const [notification, setNotification] = useState(null);
  const [channelProfileLinks, setChannelProfileLinks] = useState({});

  const readOnly = mode === 'finalizado';
  const canPublish =
    selectedChannels.length > 0 &&
    String(form.titulo || '').trim().length >= 8 &&
    String(form.descripcion || '').trim().length >= 25;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getInventoryPublications(inventarioId);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo cargar publicación');
      }

      setData(response);
      const nextLinks = {};
      (response.canalesConfig || []).forEach((channel) => {
        nextLinks[channel.canal] = channel.profileUrl || '';
      });
      setChannelProfileLinks(nextLinks);

      if (!selectedChannels.length && Array.isArray(response.canalesDisponibles)) {
        setSelectedChannels(response.canalesDisponibles.slice(0, 1));
      }
    } catch (error) {
      console.error('Error cargando publicación:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo cargar publicación.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => setNotification(null), 3800);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventarioId]);

  const publicacionesPorCanal = useMemo(() => {
    const map = {};
    (data?.publicaciones || []).forEach((item) => {
      map[item.canal] = item;
    });
    return map;
  }, [data?.publicaciones]);

  const canalesDisponibles = data?.canalesDisponibles || [];
  const canalesConfigMap = useMemo(() => {
    const map = {};
    (data?.canalesConfig || []).forEach((item) => {
      map[item.canal] = item;
    });
    return map;
  }, [data?.canalesConfig]);
  const configuredChannels = canalesDisponibles.filter((channel) => {
    const config = canalesConfigMap[channel];
    return config?.configured && config?.activo;
  });

  const toggleChannel = (channel) => {
    const config = canalesConfigMap[channel];
    if (!config?.configured || !config?.activo) {
      setNotification({
        type: 'warning',
        message: `El canal ${CHANNEL_LABELS[channel] || channel} no está configurado/activo.`
      });
      return;
    }

    setSelectedChannels((prev) => {
      if (prev.includes(channel)) {
        return prev.filter((item) => item !== channel);
      }
      return [...prev, channel];
    });
  };

  const handlePublish = async () => {
    try {
      if (!selectedChannels.length) {
        setNotification({
          type: 'warning',
          message: 'Selecciona al menos un canal.'
        });
        return;
      }

      if (!canPublish) {
        setNotification({
          type: 'warning',
          message: 'Completa título y descripción para publicar.'
        });
        return;
      }

      setSaving(true);

      const response = await publishInventory(inventarioId, {
        canales: selectedChannels,
        titulo: form.titulo,
        descripcion: form.descripcion
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo publicar');
      }

      await loadData();

      if (typeof onPublished === 'function') {
        await onPublished();
      }

      setNotification({
        type: 'success',
        message: 'Publicación procesada correctamente.'
      });
    } catch (error) {
      console.error('Error publicando inventario:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo publicar.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = async (publicationId) => {
    try {
      const response = await retryInventoryPublication(inventarioId, publicationId);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo reintentar publicación');
      }

      await loadData();

      if (typeof onPublished === 'function') {
        await onPublished();
      }
    } catch (error) {
      console.error('Error al reintentar publicación:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo reintentar publicación.'
      });
    }
  };

  const handleStatusChange = async (publicationId, status) => {
    try {
      const response = await updateInventoryPublicationStatus(inventarioId, publicationId, status);

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo actualizar estado');
      }

      await loadData();

      setNotification({
        type: 'success',
        message: status === 'paused' ? 'Canal pausado correctamente.' : 'Canal reactivado.'
      });
    } catch (error) {
      console.error('Error actualizando estado de publicación:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo actualizar estado de publicación.'
      });
    }
  };

  const handleSaveChannelConfig = async (channel) => {
    try {
      const response = await savePublicationChannelConfig({
        canal: channel,
        activo: true,
        profileUrl: channelProfileLinks[channel] || ''
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'No se pudo guardar configuración');
      }

      await loadData();
      setNotification({
        type: 'success',
        message: `Configuración guardada para ${CHANNEL_LABELS[channel] || channel}.`
      });
    } catch (error) {
      console.error('Error guardando configuración de canal:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'No se pudo guardar configuración del canal.'
      });
    }
  };

  const handleLoadGlobalConfig = async () => {
    try {
      const response = await getPublicationChannelsConfig();
      if (!response?.ok) return;

      const map = {};
      (response.canales || []).forEach((channel) => {
        map[channel.canal] = channel.profileUrl || '';
      });
      setChannelProfileLinks(map);
    } catch (error) {
      console.error('Error cargando configuración de canales:', error);
    }
  };

  if (loading) {
    return <div style={styles.box}>Cargando módulo de publicación...</div>;
  }

  return (
    <div style={styles.page}>
      <section style={styles.box}>
        <h3 style={styles.title}>Publicación multicanal</h3>
        <p style={styles.subtitle}>
          Publica esta unidad en múltiples canales, conserva URL final y seguimiento por canal.
        </p>

        {notification && (
          <div
            style={{
              ...styles.notification,
              ...(notification.type === 'success' ? styles.notificationSuccess : {}),
              ...(notification.type === 'warning' ? styles.notificationWarning : {}),
              ...(notification.type === 'error' ? styles.notificationError : {})
            }}
          >
            {notification.message}
          </div>
        )}

        <div style={styles.configCard}>
          <h4 style={styles.configTitle}>Configuración rápida por canal</h4>
          <p style={styles.configText}>
            Nosotros conectamos el webhook/provider y el usuario solo coloca su link de perfil/publicación.
          </p>

          <div style={styles.configGrid}>
            {canalesDisponibles.map((channel) => (
              <div key={channel} style={styles.configItem}>
                <strong style={styles.configChannel}>{CHANNEL_LABELS[channel] || channel}</strong>
                <input
                  style={styles.input}
                  placeholder="https://..."
                  value={channelProfileLinks[channel] || ''}
                  onChange={(e) =>
                    setChannelProfileLinks((prev) => ({ ...prev, [channel]: e.target.value }))
                  }
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => handleSaveChannelConfig(channel)}
                  >
                    Guardar link
                  </button>
                )}
              </div>
            ))}
          </div>

          {!readOnly && (
            <button type="button" style={styles.ghostButton} onClick={handleLoadGlobalConfig}>
              Recargar configuración
            </button>
          )}
        </div>

        <div style={styles.checklist}>
          <ChecklistItem
            ok={selectedChannels.length > 0}
            label={`Canales seleccionados (${selectedChannels.length})`}
          />
          <ChecklistItem
            ok={configuredChannels.length > 0}
            label={`Canales conectados (${configuredChannels.length}/${canalesDisponibles.length})`}
          />
          <ChecklistItem
            ok={String(form.titulo || '').trim().length >= 8}
            label="Título comercial (mínimo 8 caracteres)"
          />
          <ChecklistItem
            ok={String(form.descripcion || '').trim().length >= 25}
            label="Descripción comercial (mínimo 25 caracteres)"
          />
        </div>

        <div style={styles.channelGrid}>
          {canalesDisponibles.map((channel) => {
            const isActive = selectedChannels.includes(channel);

            return (
              <button
                key={channel}
                type="button"
                onClick={() => toggleChannel(channel)}
                disabled={readOnly}
                style={{
                  ...styles.channelButton,
                  ...(isActive ? styles.channelButtonActive : {}),
                  ...(!canalesConfigMap[channel]?.configured || !canalesConfigMap[channel]?.activo
                    ? styles.channelButtonDisabled
                    : {})
                }}
              >
                {CHANNEL_LABELS[channel] || channel}{' '}
                {!canalesConfigMap[channel]?.configured || !canalesConfigMap[channel]?.activo
                  ? '(sin configurar)'
                  : ''}
              </button>
            );
          })}
        </div>

        <div style={styles.formGrid}>
          <label style={styles.field}>
            <span style={styles.label}>Título comercial</span>
            <input
              style={styles.input}
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej. Nissan Versa 2021 Automático"
              disabled={readOnly}
            />
          </label>

          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span style={styles.label}>Descripción del anuncio</span>
            <textarea
              style={styles.textarea}
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe equipamiento, estado, kilometraje y beneficios de compra."
              disabled={readOnly}
            />
          </label>
        </div>

        {!readOnly && (
          <button
            type="button"
            style={{
              ...styles.primaryButton,
              opacity: canPublish ? 1 : 0.55,
              cursor: canPublish ? 'pointer' : 'not-allowed'
            }}
            disabled={saving || !canPublish}
            onClick={handlePublish}
          >
            {saving ? 'Publicando...' : 'Publicar en canales seleccionados'}
          </button>
        )}
      </section>

      <section style={styles.box}>
        <h4 style={styles.sectionTitle}>Estado por canal</h4>

        <div style={styles.list}>
          {canalesDisponibles.map((channel) => {
            const item = publicacionesPorCanal[channel];
            const status = item?.status || 'draft';

            return (
              <div key={channel} style={styles.listItem}>
                <div>
                  <strong style={styles.channelName}>{CHANNEL_LABELS[channel] || channel}</strong>
                  <p style={styles.meta}>Publicado: {formatDateTime(item?.published_at)}</p>
                  {item?.external_url ? (
                    <a href={item.external_url} target="_blank" rel="noreferrer" style={styles.link}>
                      Ver anuncio
                    </a>
                  ) : (
                    <span style={styles.meta}>Sin URL publicada aún</span>
                  )}
                </div>

                <div style={styles.statusArea}>
                  <span style={{ ...styles.statusBadge, ...(statusStyles[status] || statusStyles.draft) }}>
                    {status}
                  </span>

                  {status === 'failed' && !readOnly ? (
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleRetry(item.id)}
                    >
                      Reintentar
                    </button>
                  ) : null}

                  {status === 'published' && !readOnly ? (
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleStatusChange(item.id, 'paused')}
                    >
                      Pausar
                    </button>
                  ) : null}

                  {status === 'paused' && !readOnly ? (
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleStatusChange(item.id, 'published')}
                    >
                      Reactivar
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={styles.box}>
        <h4 style={styles.sectionTitle}>Historial de eventos</h4>

        {!(data?.eventos || []).length ? (
          <div style={styles.empty}>Sin eventos de publicación todavía.</div>
        ) : (
          <div style={styles.events}>
            {data.eventos.map((evento) => (
              <div key={evento.id} style={styles.eventItem}>
                <strong style={styles.eventType}>{evento.tipo}</strong>
                <span style={styles.eventMeta}>
                  {CHANNEL_LABELS[evento.canal] || evento.canal || 'General'} · {formatDateTime(evento.created_at)}
                </span>
                <p style={styles.eventDetail}>{evento.detalle || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChecklistItem({ ok, label }) {
  return (
    <div style={styles.checkItem}>
      <span style={{ ...styles.checkDot, ...(ok ? styles.checkDotOk : {}) }}>{ok ? '✓' : '•'}</span>
      <span style={styles.checkLabel}>{label}</span>
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: '12px'
  },
  box: {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },
  title: {
    margin: 0,
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: 950
  },
  subtitle: {
    margin: '6px 0 12px 0',
    color: '#64748b',
    fontSize: '13px'
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    color: '#0f172a',
    fontSize: '15px',
    fontWeight: 900
  },
  configCard: {
    border: '1px solid #dbe4f0',
    background: '#f8fafc',
    borderRadius: '14px',
    padding: '10px',
    marginBottom: '12px'
  },
  configTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 900
  },
  configText: {
    margin: '4px 0 8px 0',
    color: '#64748b',
    fontSize: '12px'
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  configItem: {
    display: 'grid',
    gap: '6px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    background: '#ffffff',
    padding: '8px'
  },
  configChannel: {
    color: '#0f172a',
    fontSize: '12px'
  },
  ghostButton: {
    marginTop: '8px',
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    fontWeight: 800,
    cursor: 'pointer',
    padding: 0
  },
  notification: {
    border: '1px solid transparent',
    borderRadius: '12px',
    padding: '9px 10px',
    fontSize: '12px',
    fontWeight: 800,
    marginBottom: '12px'
  },
  notificationSuccess: {
    background: '#ecfdf5',
    color: '#166534',
    borderColor: '#86efac'
  },
  notificationWarning: {
    background: '#fff7ed',
    color: '#9a3412',
    borderColor: '#fdba74'
  },
  notificationError: {
    background: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca'
  },
  checklist: {
    display: 'grid',
    gap: '6px',
    marginBottom: '12px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
  },
  checkDot: {
    width: '20px',
    height: '20px',
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 900,
    background: '#e2e8f0',
    color: '#475569',
    fontSize: '12px'
  },
  checkDotOk: {
    background: '#dcfce7',
    color: '#166534'
  },
  checkLabel: {
    color: '#334155',
    fontSize: '12px',
    fontWeight: 700
  },
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '12px'
  },
  channelButton: {
    border: '1px solid #dbe4f0',
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '10px',
    fontWeight: 800,
    color: '#334155',
    cursor: 'pointer'
  },
  channelButtonActive: {
    borderColor: '#2563eb',
    background: '#eff6ff',
    color: '#1d4ed8'
  },
  channelButtonDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px'
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
  textarea: {
    width: '100%',
    minHeight: '85px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '10px 11px',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  primaryButton: {
    border: 'none',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '12px 14px',
    fontWeight: 900,
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '10px',
    padding: '7px 10px',
    fontWeight: 800,
    cursor: 'pointer'
  },
  list: {
    display: 'grid',
    gap: '10px'
  },
  listItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '12px',
    background: '#fbfdff',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  channelName: {
    color: '#0f172a',
    fontSize: '14px'
  },
  meta: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '12px'
  },
  statusArea: {
    display: 'grid',
    alignContent: 'start',
    gap: '8px',
    justifyItems: 'end'
  },
  statusBadge: {
    display: 'inline-flex',
    border: '1px solid transparent',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 900,
    padding: '5px 9px',
    textTransform: 'uppercase'
  },
  link: {
    display: 'inline-block',
    marginTop: '5px',
    color: '#2563eb',
    fontWeight: 800,
    fontSize: '12px',
    textDecoration: 'none'
  },
  empty: {
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    color: '#64748b',
    fontWeight: 700
  },
  events: {
    display: 'grid',
    gap: '8px'
  },
  eventItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px'
  },
  eventType: {
    fontSize: '12px',
    color: '#0f172a'
  },
  eventMeta: {
    display: 'block',
    marginTop: '3px',
    fontSize: '11px',
    color: '#64748b'
  },
  eventDetail: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#334155'
  }
};
