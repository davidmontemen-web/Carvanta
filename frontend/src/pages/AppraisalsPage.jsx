import { useEffect, useMemo, useState } from 'react';
import AppraisalFormWorkspace from '../components/appraisals/AppraisalFormWorkspace';
import AppraisalDetailModal from '../components/appraisals/AppraisalDetailModal';
import {
  getAppraisals,
  createAppraisal,
  updateAppraisal,
  getAppraisalById
} from '../services/appraisalService';

const getEmptyAppraisal = (usuario) => ({
  id: Date.now(),
  folio: `AVL-${String(Date.now()).slice(-4)}`,
  clienteNombre: '',
  clienteTelefono: '',
  vehiculoInteres: '',
  fechaAvaluo: new Date().toISOString().slice(0, 10),
  fechaActualizacion: new Date().toLocaleString('es-MX'),
  estatus: 'borrador',
  asesorVentas: usuario ? `${usuario.nombre} ${usuario.apellido}` : '',
  generales: {
    marca: '',
    subMarca: '',
    version: '',
    transmision: '',
    numeroSerie: '',
    anioModelo: '',
    color: '',
    kilometraje: '',
    numeroDuenios: '',
    placas: '',
    complementarios: '',
    comentarios: ''
  },
  documentacion: {
    factura: '',
    cartaOrigen: '',
    tenencias: '',
    ultimoServicio: '',
    verificacion: '',
    manuales: '',
    garantia: '',
    engomado: '',
    tarjetaCirculacion: '',
    polizaSeguro: '',
    comentarios: ''
  },
  interior: {
    vestiduras: '',
    cielo: '',
    consola: '',
    alfombras: '',
    tablero: '',
    encendedor: '',
    puertas: '',
    volante: '',
    consolaDos: ''
  },
  carroceria: {
    observaciones: ''
  },
  sistemaElectrico: {
    espejosElectricos: false,
    bolsasAire: false,
    aireAcondicionado: false,
    controlCrucero: false,
    chisguetero: false,
    luzMapa: false,
    funcionesVolante: false,
    checkEngine: false,
    asientosElectricos: false,
    claxon: false,
    lucesInternas: false,
    segurosElectricos: false,
    cristalesElectricos: false,
    aperturaCajuela: false,
    pantalla: false,
    farosNiebla: false,
    lucesExternas: false,
    limpiadores: false,
    estereoUsb: false,
    quemacocos: false,
    testigos: false,
    direccionales: false
  },
  fugasMotor: {
    motor: '',
    transmision: '',
    sistemaFrenos: '',
    direccionHidraulica: '',
    amortiguadores: '',
    anticongelante: '',
    aireAcondicionado: '',
    flechas: '',
    soportesMotor: '',
    soportesCaja: '',
    comentarios: ''
  },
  valuacion: {
    tomaLibro: '',
    ventaLibro: '',
    reparaciones: '',
    tomaAutorizada: ''
  },
  fotosGenerales: [],
  fotosDetalle: [],
  historial: []
});

function KpiCard({ title, value, subtitle }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiSubtitle}>{subtitle}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const badgeStyles =
    status === 'completo'
      ? styles.badgeComplete
      : status === 'incompleto'
      ? styles.badgeIncomplete
      : styles.badgeDraft;

  return (
    <span style={{ ...styles.badge, ...badgeStyles }}>
      {status}
    </span>
  );
}

export default function AppraisalsPage({ usuario }) {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [quickTab, setQuickTab] = useState('todos');
  const [mode, setMode] = useState('list');
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const cerrarSesionPorError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  const cargarAppraisals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAppraisals();
      setAppraisals(data.appraisals || []);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        cerrarSesionPorError();
        return;
      }
      setError(err?.response?.data?.error || 'Error al cargar avalúos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAppraisals();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const totals = useMemo(() => {
    const total = appraisals.length;
    const borradores = appraisals.filter((x) => x.estatus === 'borrador').length;
    const incompletos = appraisals.filter((x) => x.estatus === 'incompleto').length;
    const completos = appraisals.filter((x) => x.estatus === 'completo').length;

    return { total, borradores, incompletos, completos };
  }, [appraisals]);

  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((item) => {
      const text =
        `${item.folio} ${item.clienteNombre} ${item.clienteTelefono} ${item.vehiculoInteres} ${item.asesorVentas}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const effectiveStatus = quickTab !== 'todos' ? quickTab : statusFilter;
      const matchesStatus =
        effectiveStatus === 'todos' ? true : item.estatus === effectiveStatus;

      return matchesSearch && matchesStatus;
    });
  }, [appraisals, search, statusFilter, quickTab]);

  const handleCreate = () => {
    setSelectedAppraisal(getEmptyAppraisal(usuario));
    setMode('create');
  };

  const handleEdit = async (appraisal) => {
    try {
      const data = await getAppraisalById(appraisal.id);
      setSelectedAppraisal(data.appraisal);
      setMode('edit');
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al cargar el avalúo');
    }
  };

  const handleView = async (appraisal) => {
    try {
      const data = await getAppraisalById(appraisal.id);
      setSelectedAppraisal(data.appraisal);
      setDetailOpen(true);
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al obtener detalle');
    }
  };

  const saveAppraisalWithStatus = async (data, status, options = {}) => {
    try {
      setSaving(true);

      const payload = {
        ...data,
        fechaActualizacion: new Date().toLocaleString('sv-SE').replace('T', ' '),
        estatus: status
      };

      const exists = appraisals.some((item) => String(item.id) === String(payload.id));

      let appraisalId = payload.id;

      if (exists) {
        const res = await updateAppraisal(payload.id, payload);
        appraisalId = res?.appraisalId || payload.id;
      } else {
        const res = await createAppraisal(payload);
        appraisalId = res?.appraisalId || payload.id;
      }

      await cargarAppraisals();

      const refreshed = await getAppraisalById(appraisalId);

      if (status === 'borrador') {
        setSuccessMessage('Avalúo guardado como borrador');
      } else if (status === 'incompleto') {
        setSuccessMessage('Avalúo guardado como incompleto');
      } else if (status === 'completo') {
        setSuccessMessage('Avalúo marcado como completo correctamente');
      }

      setSelectedAppraisal(refreshed.appraisal);
      setMode('edit');

      return {
        ok: true,
        appraisal: refreshed.appraisal
      };
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al guardar el avalúo');
      return { ok: false };
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (data, options = {}) => {
    return await saveAppraisalWithStatus(data, 'borrador', options);
  };

  const handleSaveIncomplete = async (data, options = {}) => {
    return await saveAppraisalWithStatus(data, 'incompleto', options);
  };

  const handleMarkComplete = async (data, options = {}) => {
    return await saveAppraisalWithStatus(data, 'completo', options);
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <AppraisalFormWorkspace
        mode={mode}
        initialData={selectedAppraisal}
        onBack={() => {
          setMode('list');
          setSelectedAppraisal(null);
        }}
        onSaveDraft={handleSaveDraft}
        onSaveIncomplete={handleSaveIncomplete}
        onMarkComplete={handleMarkComplete}
        saving={saving}
      />
    );
  }

  return (
    <div style={styles.page}>
      {successMessage && (
        <div style={styles.successBox}>
          {successMessage}
        </div>
      )}

      <div style={styles.kpiGrid}>
        <KpiCard title="Total de avalúos" value={totals.total} subtitle="Expedientes registrados" />
        <KpiCard title="Borradores" value={totals.borradores} subtitle="Pendientes de captura" />
        <KpiCard title="Incompletos" value={totals.incompletos} subtitle="Requieren revisión" />
        <KpiCard title="Completos" value={totals.completos} subtitle="Listos para operar" />
      </div>

      <div style={styles.tabsBar}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'borrador', label: 'Borradores' },
          { key: 'incompleto', label: 'Incompletos' },
          { key: 'completo', label: 'Completos' }
        ].map((tab) => {
          const active = quickTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setQuickTab(tab.key)}
              style={{
                ...styles.tabButton,
                ...(active ? styles.tabButtonActive : {})
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={styles.toolbar}>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por folio, cliente, teléfono, vehículo o asesor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="todos">Todos los estatus</option>
            <option value="borrador">Borrador</option>
            <option value="incompleto">Incompleto</option>
            <option value="completo">Completo</option>
          </select>
        </div>

        <button style={styles.primaryButton} onClick={handleCreate}>
          + Nuevo avalúo
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>Listado de avalúos</h2>
            <p style={styles.sectionSubtitle}>
              Administra expedientes, filtra por estatus y entra al formulario maestro.
            </p>
          </div>

          <div style={styles.resultsCount}>
            {filteredAppraisals.length} resultado{filteredAppraisals.length === 1 ? '' : 's'}
          </div>
        </div>

        {loading ? (
          <p>Cargando avalúos...</p>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : filteredAppraisals.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <h3 style={styles.emptyTitle}>No encontramos avalúos</h3>
            <p style={styles.emptyText}>
              Ajusta tus filtros o crea un nuevo expediente de avalúo.
            </p>
            <button style={styles.primaryButton} onClick={handleCreate}>
              Crear avalúo
            </button>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Vehículo interés</th>
                  <th style={styles.th}>Asesor</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Actualización</th>
                  <th style={styles.th}>Estatus</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppraisals.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}><strong>{item.folio}</strong></td>
                    <td style={styles.td}>{item.clienteNombre || '-'}</td>
                    <td style={styles.td}>{item.clienteTelefono || '-'}</td>
                    <td style={styles.td}>{item.vehiculoInteres || '-'}</td>
                    <td style={styles.td}>{item.asesorVentas || '-'}</td>
                    <td style={styles.td}>{item.fechaAvaluo || '-'}</td>
                    <td style={styles.td}>{item.fechaActualizacion || '-'}</td>
                    <td style={styles.td}><StatusBadge status={item.estatus} /></td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button style={styles.actionButton} onClick={() => handleView(item)}>
                          Ver
                        </button>
                        <button style={styles.actionButtonStrong} onClick={() => handleEdit(item)}>
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  page: { display: 'grid', gap: '20px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' },
  kpiCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f7'
  },
  kpiValue: { fontSize: '32px', fontWeight: 800, color: '#111827', lineHeight: 1 },
  kpiTitle: { marginTop: '10px', fontSize: '15px', fontWeight: 700, color: '#111827' },
  kpiSubtitle: { marginTop: '6px', color: '#6b7280', fontSize: '13px' },
  tabsBar: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tabButton: {
    border: '1px solid #dbe3ee',
    background: '#fff',
    color: '#4b5563',
    borderRadius: '999px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700
  },
  successBox: {
    background: '#dcfce7',
    color: '#166534',
    padding: '14px 18px',
    borderRadius: '12px',
    fontWeight: 600
  },
  tabButtonActive: {
    background: '#111827',
    color: '#fff',
    border: '1px solid #111827'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1
  },
  input: {
    flex: 1,
    minWidth: '300px',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    background: '#fff',
    fontSize: '15px'
  },
  select: {
    minWidth: '240px',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    background: '#fff',
    fontSize: '15px'
  },
  primaryButton: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 18px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '22px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    overflowX: 'auto'
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#111827'
  },
  sectionSubtitle: {
    marginTop: '8px',
    marginBottom: 0,
    color: '#6b7280'
  },
  resultsCount: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#374151',
    padding: '10px 14px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '14px'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
  th: {
    textAlign: 'left',
    padding: '14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 700
  },
  td: {
    padding: '16px 14px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
    fontSize: '14px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'capitalize'
  },
  badgeDraft: { background: '#e5e7eb', color: '#374151' },
  badgeIncomplete: { background: '#fef3c7', color: '#92400e' },
  badgeComplete: { background: '#dcfce7', color: '#166534' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '9px 12px',
    cursor: 'pointer',
    fontWeight: 600
  },
  actionButtonStrong: {
    background: '#111827',
    color: '#fff',
    border: '1px solid #111827',
    borderRadius: '10px',
    padding: '9px 12px',
    cursor: 'pointer',
    fontWeight: 700
  },
  emptyState: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '20px'
  },
  emptyIcon: { fontSize: '42px' },
  emptyTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#111827'
  },
  emptyText: {
    margin: 0,
    maxWidth: '420px',
    color: '#6b7280'
  },
  errorBox: {
    padding: '14px',
    borderRadius: '10px',
    background: '#fee2e2',
    color: '#b91c1c'
  }
};