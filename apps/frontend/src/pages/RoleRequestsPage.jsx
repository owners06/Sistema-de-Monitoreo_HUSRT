import { useState, useEffect } from 'react'
import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from '../api'
import { useToast } from '../context/ToastContext'

const ROLE_NAMES = { admin: 'Administrador', operator: 'Operador', viewer: 'Visor' }

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [processing, setProcessing] = useState(null) // id being processed
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getRoleRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      toast('Error al cargar solicitudes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    setProcessing(id)
    try {
      await approveRoleRequest(id)
      toast('Solicitud aprobada', 'success')
      load()
    } catch (err) {
      toast(err.response?.data?.error || 'Error al aprobar', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id) => {
    setProcessing(id)
    try {
      await rejectRoleRequest(id)
      toast('Solicitud rechazada', 'success')
      load()
    } catch (err) {
      toast(err.response?.data?.error || 'Error al rechazar', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'pending') return <span className="badge badge-warning"><span className="badge-dot" /> Pendiente</span>
    if (status === 'approved') return <span className="badge badge-success"><span className="badge-dot" /> Aprobada</span>
    if (status === 'rejected') return <span className="badge badge-danger"><span className="badge-dot" /> Rechazada</span>
    return <span className="badge badge-info">{status}</span>
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">📋 Solicitudes de Rol</p>
          <p className="topbar-subtitle">Revisa y gestiona las solicitudes de cambio de rol</p>
        </div>
        <div className="topbar-actions">
          {pendingCount > 0 && (
            <span className="badge badge-warning" style={{ fontSize: 13 }}>
              <span className="badge-dot" style={{ animation: 'pulse 2s infinite' }} /> {pendingCount} pendientes
            </span>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'pending', label: '⏳ Pendientes' },
            { key: 'approved', label: '✅ Aprobadas' },
            { key: 'rejected', label: '❌ Rechazadas' },
            { key: 'all', label: '📋 Todas' },
          ].map((f) => (
            <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f.key)} style={{ fontSize: 12 }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><span>Cargando solicitudes...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>📋</div>
              <h3>Sin solicitudes</h3>
              <p>No hay solicitudes de cambio de rol que coincidan con el filtro.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol Actual</th>
                    <th>Rol Solicitado</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, i) => (
                    <tr key={req.id}>
                      <td className="td-muted">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{req.user_username}</td>
                      <td className="td-muted">{req.user_email}</td>
                      <td><span className={`role-badge role-${req.current_role}`}>{ROLE_NAMES[req.current_role] || req.current_role}</span></td>
                      <td>
                        <span className="role-change-arrow">→</span>
                        <span className={`role-badge role-${req.requested_role}`}>{ROLE_NAMES[req.requested_role] || req.requested_role}</span>
                      </td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td className="td-muted">{req.created_at ? new Date(req.created_at).toLocaleDateString('es-CO') : '—'}</td>
                      <td>
                        {req.status === 'pending' ? (
                          <div className="td-actions">
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: 11, padding: '5px 10px' }}
                              onClick={() => handleApprove(req.id)}
                              disabled={processing === req.id}
                            >
                              {processing === req.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✓'} Aprobar
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ fontSize: 11, padding: '5px 10px' }}
                              onClick={() => handleReject(req.id)}
                              disabled={processing === req.id}
                            >
                              ✕ Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="td-muted">—</span>
                        )}
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
