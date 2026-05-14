import { useState, useEffect } from 'react'
import { getAlerts, deleteAlert } from '../api'
import { useToast } from '../context/ToastContext'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getAlerts()
      setAlerts(Array.isArray(data) ? data : [])
    } catch {
      toast('Error al cargar alertas', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta alerta?')) return
    try {
      await deleteAlert(id)
      toast('Alerta eliminada', 'success')
      load()
    } catch {
      toast('Error al eliminar', 'error')
    }
  }

  const getSeverityClass = (severity) => {
    if (!severity) return 'badge-info'
    const s = severity.toLowerCase()
    if (s === 'critical' || s === 'critica' || s === 'alta') return 'badge-danger'
    if (s === 'warning' || s === 'media') return 'badge-warning'
    return 'badge-info'
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => {
    const s = (a.severity || '').toLowerCase()
    if (filter === 'critical') return s === 'critical' || s === 'critica' || s === 'alta'
    if (filter === 'warning') return s === 'warning' || s === 'media'
    return true
  })

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">🚨 Alertas</p>
          <p className="topbar-subtitle">Monitoreo de anomalías y eventos críticos</p>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-danger" style={{ fontSize: 13 }}>{alerts.length} alertas</span>
        </div>
      </div>

      <div className="page-body">
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'critical', 'warning'].map((f) => (
            <button key={f} id={`filter-${f}`} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 12 }}>
              {f === 'all' ? 'Todas' : f === 'critical' ? '🔴 Críticas' : '🟡 Advertencias'}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><span>Cargando alertas...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>✅</div>
              <h3>Sin alertas</h3>
              <p>No hay alertas que coincidan con el filtro seleccionado.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mensaje</th>
                    <th>Dispositivo ID</th>
                    <th>Severidad</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((alert, i) => (
                    <tr key={alert.id || i} style={{ borderLeft: alert.severity?.toLowerCase() === 'critical' ? '3px solid var(--danger)' : 'none' }}>
                      <td className="td-muted">{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{alert.message || `Alerta #${alert.id}`}</td>
                      <td><span className="badge badge-info">ID: {alert.device_id || '—'}</span></td>
                      <td>
                        <span className={`badge ${getSeverityClass(alert.severity)}`}>
                          <span className="badge-dot" />
                          {alert.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="td-muted">{alert.type || '—'}</td>
                      <td>
                        <button className="btn-icon danger" title="Descartar alerta" onClick={() => handleDelete(alert.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
