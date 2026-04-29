import { useEffect, useMemo, useState } from 'react';
import AppraisalFormWorkspace from '../components/appraisals/AppraisalFormWorkspace';
import AppraisalDetailModal from '../components/appraisals/AppraisalDetailModal';
import {
  getAppraisals,
  createAppraisal,
  updateAppraisal,
  getAppraisalById
} from '../services/appraisalService';
import { getEmptyAppraisal, formatMysqlDateTime } from '../utils/appraisalDefaults';
import {
  getSuccessMessageByStatus,
  withPersistedFlag,
  sanitizeAppraisalBeforeSave,
  getTotals
} from './appraisals/appraisalsHelpers';

const PAGE_SIZE = 15;

function KpiCard({ label, value, subtitle, tone = 'default' }) {
  const toneMap = {
    default: {
      border: '1px solid #e5e7eb',
      background: '#ffffff'
    },
    warning: {
      border: '1px solid #fde68a',
      background: '#fffbeb'
    },
    success: {
      border: '1px solid #bbf7d0',
      background: '#f0fdf4'
    },
    danger: {
      border: '1px solid #fecaca',
      background: '#fef2f2'
    },
    info: {
      border: '1px solid #dbeafe',
      background: '#eff6ff'
    }
  };

  return (
    <div style={{ ...styles.kpiCard, ...toneMap[tone] }}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiSubtitle}>{subtitle}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || 'borrador').toLowerCase();

  const config =
    normalized === 'completo'
      ? { label: 'Completo', style: styles.badgeComplete }
      : { label: 'Borrador', style: styles.badgeDraft };

  return <span style={{ ...styles.badge, ...config.style }}>{config.label}</span>;
}

function ProgressBar({ progress }) {
  const tone =
    progress >= 100
      ? { fill: '#16a34a', track: '#dcfce7' }
      : progress >= 60
      ? { fill: '#2563eb', track: '#dbeafe' }
      : { fill: '#d97706', track: '#fef3c7' };

  return (
    <div style={styles.progressWrap}>
      <div style={styles.progressTextRow}>
        <span style={styles.progressText}>{progress}%</span>
      </div>
      <div style={{ ...styles.progressTrack, background: tone.track }}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
            background: tone.fill
          }}
        />
      </div>
    </div>
  );
}

const isValidDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const isSameDay = (value, compareDate = new Date()) => {
  if (!isValidDate(value)) return false;

  const date = new Date(value);

  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
};

const formatDateLabel = (value) => {
  if (!isValidDate(value)) return '-';

  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateTimeLabel = (value) => {
  if (!isValidDate(value)) return '-';

  return new Date(value).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRelativeUpdateLabel = (value) => {
  if (!isValidDate(value)) return 'Sin actualización';

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Hace 1 día';
  return `Hace ${diffDays} días`;
};

const getRelativeTone = (status, value) => {
  if (!isValidDate(value)) return styles.relativeNeutral;

  const date = new Date(value);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / 36e5;

  if ((status || '').toLowerCase() === 'completo') return styles.relativeSuccess;
  if (diffHours > 48) return styles.relativeDanger;
  if (diffHours > 24) return styles.relativeWarning;

  return styles.relativeNeutral;
};

const getDatePresetLabel = (preset) => {
  switch (preset) {
    case 'today':
      return 'Hoy';
    case '7d':
      return 'Últimos 7 días';
    case '30d':
      return 'Últimos 30 días';
    case 'custom':
      return 'Rango personalizado';
    default:
      return 'Todas las fechas';
  }
};

const extractVehicleToBuy = (appraisal) => {
  const generales = appraisal?.generales || {};

  const possibleKeys = [
    'vehiculoTomado',
    'vehiculoAvaluado',
    'vehiculoComprar',
    'unidadTomada',
    'unidadAvaluada',
    'vehiculo',
    'descripcionVehiculo'
  ];

  for (const key of possibleKeys) {
    if (generales[key]) return String(generales[key]).trim();
  }

  const marca =
    generales.marca ||
    generales.marcaVehiculo ||
    generales.marcaUnidad ||
    generales.brand ||
    '';
  const modelo =
    generales.modelo ||
    generales.submarca ||
    generales.modeloVehiculo ||
    generales.model ||
    '';
  const version =
    generales.version ||
    generales.tipo ||
    generales.versionVehiculo ||
    '';
  const anio =
    generales.anio ||
    generales.year ||
    generales.modeloAnio ||
    '';

  const parts = [marca, modelo, version, anio].filter(Boolean).map((v) => String(v).trim());

  return parts.length ? parts.join(' ') : '-';
};

const getProgressByAppraisal = (appraisal) => {
  const status = (appraisal?.estatus || 'borrador').toLowerCase();

  if (status === 'completo') return 100;

  let score = 15;

  if (appraisal?.clienteNombre) score += 10;
  if (appraisal?.clienteTelefono) score += 10;
  if (appraisal?.asesorVentas) score += 5;
  if (appraisal?.fechaAvaluo) score += 5;

  const generales = appraisal?.generales || {};
  const valuacion = appraisal?.valuacion || {};
  const fotosGenerales = appraisal?.fotosGenerales || [];
  const fotosDetalle = appraisal?.fotosDetalle || [];

  const generalFields = [
    generales.marca,
    generales.modelo,
    generales.version,
    generales.anio,
    generales.color,
    generales.kilometraje
  ].filter(Boolean).length;

  score += Math.min(generalFields * 5, 20);

  const valuationFields = [
    valuacion.precioToma,
    valuacion.precioVenta,
    valuacion.valorComercial,
    valuacion.observaciones
  ].filter(Boolean).length;

  score += Math.min(valuationFields * 7, 20);

  if (fotosGenerales.length > 0) score += 10;
  if (fotosDetalle.length > 0) score += 5;

  return Math.min(score, 95);
};

const requiresAttention = (appraisal) => {
  const status = (appraisal?.estatus || 'borrador').toLowerCase();

  if (status !== 'borrador') return false;
  if (!isValidDate(appraisal?.fechaActualizacion)) return true;

  const lastUpdate = new Date(appraisal.fechaActualizacion);
  const now = new Date();
  const diffHours = (now.getTime() - lastUpdate.getTime()) / 36e5;

  return diffHours >= 24;
};

const hasDateInPreset = (value, preset, fromDate, toDate) => {
  if (!value || !isValidDate(value)) return true;

  const date = new Date(value);
  const now = new Date();

  if (preset === 'all') return true;

  if (preset === 'today') {
    return isSameDay(date, now);
  }

  if (preset === '7d') {
    const start = new Date();
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }

  if (preset === '30d') {
    const start = new Date();
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }

  if (preset === 'custom') {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    if (from && date < from) return false;
    if (to && date > to) return false;

    return true;
  }

  return true;
};

export default function AppraisalsPage({ usuario }) {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [quickTab, setQuickTab] = useState('todos');
  const [datePreset, setDatePreset] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [mode, setMode] = useState('list');
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadAppraisals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAppraisals();
      setAppraisals(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar avalúos');
    } finally {
      setLoading(false);
    }
  };

  const loadSingleAppraisal = async (id, fallbackMessage) => {
    try {
      const response = await getAppraisalById(id);
      return withPersistedFlag(response.data);
    } catch (err) {
      alert(err.message || fallbackMessage);
      return null;
    }
  };

  useEffect(() => {
    loadAppraisals();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const rawTotals = useMemo(() => getTotals(appraisals), [appraisals]);

  const totals = useMemo(
    () => ({
      total: rawTotals.total || 0,
      borradores: rawTotals.borradores || 0,
      completos: rawTotals.completos || 0
    }),
    [rawTotals]
  );

  const updatedToday = useMemo(
    () => appraisals.filter((item) => isSameDay(item.fechaActualizacion)).length,
    [appraisals]
  );

  const attentionCount = useMemo(
    () => appraisals.filter((item) => requiresAttention(item)).length,
    [appraisals]
  );

  const tabItems = [
    { key: 'todos', label: 'Todos', count: totals.total },
    { key: 'borrador', label: 'Borradores', count: totals.borradores },
    { key: 'completo', label: 'Completos', count: totals.completos }
  ];

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('todos');
    setQuickTab('todos');
    setDatePreset('all');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const filteredAppraisals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appraisals.filter((item) => {
      const status = (item.estatus || '').toLowerCase();

      const matchesQuickTab = quickTab === 'todos' ? true : status === quickTab;

      const matchesStatus =
        quickTab !== 'todos'
          ? true
          : statusFilter === 'todos'
          ? true
          : status === statusFilter;

      const haystack = [
        item.folio,
        item.clienteNombre,
        item.clienteTelefono,
        item.asesorVentas,
        extractVehicleToBuy(item)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = query ? haystack.includes(query) : true;

      const dateField = item.fechaActualizacion || item.fechaAvaluo;
      const matchesDate = hasDateInPreset(dateField, datePreset, fromDate, toDate);

      return matchesQuickTab && matchesStatus && matchesSearch && matchesDate;
    });
  }, [appraisals, quickTab, statusFilter, search, datePreset, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, quickTab, datePreset, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredAppraisals.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAppraisals = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredAppraisals.slice(start, end);
  }, [filteredAppraisals, safeCurrentPage]);

  const pageStart = filteredAppraisals.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safeCurrentPage * PAGE_SIZE, filteredAppraisals.length);

  const handleCreate = () => {
    setSelectedAppraisal(getEmptyAppraisal(usuario));
    setMode('create');
  };

  const handleBackToList = async () => {
    setMode('list');
    setSelectedAppraisal(null);
    await loadAppraisals();
  };

  const handleEdit = async (appraisal) => {
    const fullAppraisal = await loadSingleAppraisal(appraisal.id, 'Error al cargar el avalúo');
    if (!fullAppraisal) return;

    setSelectedAppraisal(fullAppraisal);
    setMode('edit');
  };

  const handleView = async (appraisal) => {
    const fullAppraisal = await loadSingleAppraisal(appraisal.id, 'Error al obtener detalle');
    if (!fullAppraisal) return;

    setSelectedAppraisal(fullAppraisal);
    setDetailOpen(true);
  };

  const persistAppraisal = async (payload, currentMode) => {
    if (currentMode === 'edit') {
      return await updateAppraisal(payload.id, payload);
    }

    return await createAppraisal(payload);
  };

  const saveAppraisalWithStatus = async (data, status) => {
    try {
      setSaving(true);

      const payload = sanitizeAppraisalBeforeSave(
        {
          ...data,
          estatus: status
        },
        formatMysqlDateTime
      );

      const persistResponse = await persistAppraisal(payload, mode);
      const appraisalId = persistResponse.appraisalId || payload.id;

      const refreshedResponse = await getAppraisalById(appraisalId);
      const refreshedAppraisal = withPersistedFlag(refreshedResponse.data);

      setSelectedAppraisal(refreshedAppraisal);
      setMode('edit');
      setSuccessMessage(getSuccessMessageByStatus(status));

      await loadAppraisals();

      return {
        ok: true,
        appraisal: refreshedAppraisal
      };
    } catch (err) {
      alert(err.message || 'Error al guardar el avalúo');
      return { ok: false };
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (data) => {
    return await saveAppraisalWithStatus(data, 'borrador');
  };

  const handleSaveComplete = async (data) => {
    return await saveAppraisalWithStatus(data, 'completo');
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <AppraisalFormWorkspace
        mode={mode}
        initialData={selectedAppraisal}
        usuario={usuario}
        onBack={handleBackToList}
        onSaveDraft={handleSaveDraft}
        onSaveIncomplete={handleSaveDraft}
        onMarkComplete={handleSaveComplete}
        saving={saving}
      />
    );
  }

  return (
    <div style={styles.page}>
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      <div style={styles.heroCard}>
        <div>
          <div style={styles.heroEyebrow}>Panel operativo</div>
          <p style={styles.heroSubtitle}>
            Seguimiento de avalúos, atención prioritaria y control de compras de seminuevos.
          </p>
        </div>

        <div style={styles.heroActions}>
          <button style={styles.refreshButton} onClick={loadAppraisals} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>

          <button style={styles.primaryButton} onClick={handleCreate}>
            + Nuevo avalúo
          </button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <KpiCard label="Total" value={totals.total} subtitle="Todos los avalúos" tone="default" />
        <KpiCard
          label="Borradores"
          value={totals.borradores}
          subtitle="Pendientes de captura"
          tone="warning"
        />
        <KpiCard
          label="Completos"
          value={totals.completos}
          subtitle="Listos para operar"
          tone="success"
        />
        <KpiCard
          label="Requieren atención"
          value={attentionCount}
          subtitle="Sin movimiento o pendientes"
          tone="danger"
        />
        <KpiCard
          label="Actualizados hoy"
          value={updatedToday}
          subtitle="Actividad reciente"
          tone="info"
        />
      </div>

      <div style={styles.controlCard}>
        <div style={styles.tabsRow}>
          <div style={styles.tabsBar}>
            {tabItems.map((tab) => {
              const isActive = quickTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setQuickTab(tab.key)}
                  style={{
                    ...styles.tabButton,
                    ...(isActive ? styles.tabButtonActive : {})
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      ...styles.tabCount,
                      ...(isActive ? styles.tabCountActive : {})
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={styles.resultsInline}>
            {getDatePresetLabel(datePreset)} · {pageStart}-{pageEnd} de {filteredAppraisals.length}
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Buscar por folio, cliente, teléfono, unidad o asesor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
            disabled={quickTab !== 'todos'}
          >
            <option value="todos">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="completo">Completo</option>
          </select>

          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            style={styles.select}
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="custom">Rango personalizado</option>
          </select>

          <button type="button" style={styles.secondaryButton} onClick={clearFilters}>
            Limpiar
          </button>
        </div>

        {datePreset === 'custom' && (
          <div style={styles.customDateRow}>
            <div style={styles.customDateGroup}>
              <label style={styles.customDateLabel}>Desde</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.customDateGroup}>
              <label style={styles.customDateLabel}>Hasta</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          </div>
        )}
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loadingBox}>Cargando avalúos...</div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : filteredAppraisals.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No encontramos avalúos</h3>
            <p style={styles.emptyText}>
              Ajusta tus filtros o crea un nuevo avalúo.
            </p>
            <button style={styles.primaryButton} onClick={handleCreate}>
              Crear avalúo
            </button>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Folio</th>
                    <th style={styles.th}>Cliente / Teléfono</th>
                    <th style={styles.th}>Unidad a comprar</th>
                    <th style={styles.th}>Asesor</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Progreso</th>
                    <th style={styles.th}>Actualización</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAppraisals.map((item) => {
                    const progress = getProgressByAppraisal(item);
                    const relativeTone = getRelativeTone(item.estatus, item.fechaActualizacion);
                    const phoneVisible = item.clienteTelefono || '-';

                    return (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.folioCell}>
                            <strong style={styles.folioValue}>{item.folio}</strong>
                            <span style={styles.folioMeta}>
                              {formatDateLabel(item.fechaAvaluo)}
                            </span>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.primaryCell}>
                            <strong style={styles.primaryLine}>{item.clienteNombre || '-'}</strong>
                            <span style={styles.phoneLine}>{phoneVisible}</span>
                          </div>
                        </td>

                        <td style={styles.tdVehicle}>
                          <div style={styles.primaryCell}>
                            <strong style={styles.primaryLineCompact}>
                              {extractVehicleToBuy(item)}
                            </strong>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.primaryLine}>{item.asesorVentas || '-'}</span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.statusColumn}>
                            <StatusBadge status={item.estatus} />
                            {requiresAttention(item) && (
                              <span style={styles.attentionTag}>Atención</span>
                            )}
                          </div>
                        </td>

                        <td style={styles.tdProgress}>
                          <ProgressBar progress={progress} />
                        </td>

                        <td style={styles.td}>
                          <div style={styles.primaryCell}>
                            <strong style={styles.primaryLineCompact}>
                              {formatDateTimeLabel(item.fechaActualizacion)}
                            </strong>
                            <span style={{ ...styles.secondaryLine, ...relativeTone }}>
                              {getRelativeUpdateLabel(item.fechaActualizacion)}
                            </span>
                          </div>
                        </td>

                        <td style={styles.tdActions}>
                          <div style={styles.actions}>
                            <button style={styles.actionButton} onClick={() => handleView(item)}>
                              Ver
                            </button>
                            <button
                              style={styles.actionButtonStrong}
                              onClick={() => handleEdit(item)}
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.paginationBar}>
              <div style={styles.paginationInfo}>
                Mostrando <strong>{pageStart}</strong> a <strong>{pageEnd}</strong> de{' '}
                <strong>{filteredAppraisals.length}</strong> avalúos
              </div>

              <div style={styles.paginationControls}>
                <button
                  style={styles.paginationButton}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Anterior
                </button>

                <span style={styles.pageIndicator}>
                  Página {safeCurrentPage} de {totalPages}
                </span>

                <button
                  style={styles.paginationButton}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AppraisalDetailModal
        abierto={detailOpen}
        appraisal={selectedAppraisal}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: '14px',
    paddingBottom: '10px'
  },

  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
  },
  heroEyebrow: {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#0f172a'
  },
  heroSubtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '13px',
    maxWidth: '760px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  refreshButton: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '10px 12px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer'
  },
  primaryButton: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer'
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '10px 12px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer'
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px'
  },
  kpiCard: {
    borderRadius: '14px',
    padding: '14px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1
  },
  kpiLabel: {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#111827'
  },
  kpiSubtitle: {
    marginTop: '4px',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: 1.35
  },

  controlCard: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)',
    padding: '12px'
  },
  tabsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    paddingBottom: '10px',
    borderBottom: '1px solid #eef2f7'
  },
  tabsBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  tabButton: {
    border: '1px solid #dbe3ee',
    background: '#fff',
    color: '#475569',
    borderRadius: '999px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  tabButtonActive: {
    background: '#0f172a',
    color: '#fff',
    border: '1px solid #0f172a'
  },
  tabCount: {
    marginLeft: '8px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    color: '#334155',
    fontSize: '10px',
    fontWeight: 800
  },
  tabCountActive: {
    background: 'rgba(255,255,255,0.14)',
    color: '#fff'
  },
  resultsInline: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 700
  },

  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 1fr) 150px 160px auto',
    gap: '8px',
    paddingTop: '10px'
  },
  input: {
    minWidth: 0,
    padding: '9px 11px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#fff',
    fontSize: '12px',
    outline: 'none'
  },
  select: {
    minWidth: 0,
    padding: '9px 11px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#fff',
    fontSize: '12px',
    outline: 'none'
  },

  customDateRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #eef2f7'
  },
  customDateGroup: {
    display: 'grid',
    gap: '6px'
  },
  customDateLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  dateInput: {
    padding: '9px 11px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#fff',
    fontSize: '12px',
    outline: 'none',
    minWidth: '160px'
  },

  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '12px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)',
    overflowX: 'hidden',
    border: '1px solid #e5e7eb'
  },

  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid #eef2f7',
    borderRadius: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: '1040px'
  },
  th: {
    textAlign: 'left',
    padding: '10px 10px',
    borderBottom: '1px solid #e5e7eb',
    color: '#64748b',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    background: '#f8fafc',
    whiteSpace: 'nowrap'
  },
  tr: {
    background: '#fff'
  },
  td: {
    padding: '10px 10px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    fontSize: '12px',
    color: '#0f172a'
  },
  tdVehicle: {
    padding: '10px 10px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    fontSize: '12px',
    color: '#0f172a',
    maxWidth: '180px'
  },
  tdProgress: {
    padding: '10px 10px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    width: '110px'
  },
  tdActions: {
    padding: '10px 10px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    width: '110px'
  },

  folioCell: {
    display: 'grid',
    gap: '3px'
  },
  folioValue: {
    fontSize: '12px',
    color: '#0f172a'
  },
  folioMeta: {
    color: '#64748b',
    fontSize: '10px'
  },

  primaryCell: {
    display: 'grid',
    gap: '3px'
  },
  primaryLine: {
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: 700
  },
  primaryLineCompact: {
    color: '#0f172a',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.35
  },
  secondaryLine: {
    color: '#64748b',
    fontSize: '10px'
  },
  phoneLine: {
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.01em'
  },

  statusColumn: {
    display: 'grid',
    gap: '5px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 800
  },
  badgeDraft: {
    background: '#fef3c7',
    color: '#92400e'
  },
  badgeComplete: {
    background: '#dcfce7',
    color: '#166534'
  },
  attentionTag: {
    width: 'fit-content',
    fontSize: '9px',
    fontWeight: 800,
    color: '#b91c1c',
    background: '#fee2e2',
    padding: '3px 6px',
    borderRadius: '999px'
  },

  progressWrap: {
    minWidth: '90px'
  },
  progressTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px'
  },
  progressText: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#0f172a'
  },
  progressTrack: {
    width: '100%',
    height: '7px',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.25s ease'
  },

  relativeNeutral: {
    color: '#64748b'
  },
  relativeSuccess: {
    color: '#16a34a',
    fontWeight: 700
  },
  relativeWarning: {
    color: '#d97706',
    fontWeight: 700
  },
  relativeDanger: {
    color: '#dc2626',
    fontWeight: 700
  },

  actions: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'nowrap'
  },
  actionButton: {
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '7px 8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '11px',
    minWidth: '44px'
  },
  actionButtonStrong: {
    background: '#0f172a',
    color: '#fff',
    border: '1px solid #0f172a',
    borderRadius: '8px',
    padding: '7px 8px',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '11px',
    minWidth: '52px'
  },

  paginationBar: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  paginationInfo: {
    fontSize: '12px',
    color: '#64748b'
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  paginationButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 10px',
    fontWeight: 700,
    fontSize: '12px',
    cursor: 'pointer'
  },
  pageIndicator: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: 700
  },

  successBox: {
    background: '#dcfce7',
    color: '#166534',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 700,
    border: '1px solid #bbf7d0',
    fontSize: '13px'
  },
  loadingBox: {
    padding: '20px',
    borderRadius: '10px',
    background: '#f8fafc',
    color: '#334155',
    fontWeight: 700,
    fontSize: '13px'
  },
  errorBox: {
    padding: '12px',
    borderRadius: '10px',
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '13px'
  },
  emptyState: {
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    padding: '20px'
  },
  emptyTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#111827',
    fontWeight: 800
  },
  emptyText: {
    margin: 0,
    maxWidth: '380px',
    color: '#6b7280',
    lineHeight: 1.5,
    fontSize: '13px'
  }
};
