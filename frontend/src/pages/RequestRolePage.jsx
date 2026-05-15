import { useState, useEffect } from 'react'
import { createRoleRequest, getMyRoleRequests } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const ROLES = [
  { value: 'operator', label: 'Operador', icon: '⚙️', desc: 'Dashboard + Dispositivos, Ubicaciones, Métricas y Alertas' },
  { value: 'admin', label: 'Administrador', icon: '🔐', desc: 'Acceso total al sistema y gestión de cuentas' },
]

export default function RequestRolePage() {
  const { user, getRoleName } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data } = await getMyRoleRequests()
      setMyRequests(Array.isArray(data) ? data : [])
    } catch {
      // Silenciar si no tiene acceso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const hasPending = myRequests.some(r => r.status === 'pending')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) return toast('Selecciona un rol', 'error')
    if (selectedRole === user?.role) return toast('Ya tienes ese rol asignado', 'error')

    setSending(true)
    try {
      await createRoleRequest({ requested_role: selectedRole })
      toast('Solicitud enviada exitosamente', 'success')
      setSelectedRole('')
      loadRequests()
    } catch (err) {
      toast(err.response?.data?.error || 'Error al enviar solicitud', 'error')
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'pending') return <span className="badge badge-warning"><span className="badge-dot" /> Pendiente</span>
    if (status === 'approved') return <span className="badge badge-success"><span className="badge-dot" /> Aprobada</span>
    if (status === 'rejected') return <span className="badge badge-danger"><span className="badge-dot" /> Rechazada</span>
    if (status === 'manual_adj') return <span className="badge badge-info"><span className="badge-dot" /> Ajuste Manual</span>
    return <span className="badge badge-info">{status}</span>
  }

  // Filtrar roles que ya tiene o que son más bajos
  const availableRoles = ROLES.filter(r => {
    const hierarchy = { viewer: 1, operator: 2, admin: 3 }
    return (hierarchy[r.value] || 0) > (hierarchy[user?.role] || 0)
  })

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">📤 Solicitar Cambio de Rol</p>
          <p className="topbar-subtitle">Envía una solicitud al administrador para cambiar tu nivel de acceso</p>
        </div>
        <div className="topbar-actions">
          <span className={`role-badge role-${user?.role}`}>{getRoleName(user?.role)}</span>
        </div>
      </div>

      <div className="page-body">
        <div className="grid grid-2">
          {/* Formulario de solicitud */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🛡️ Tu Rol Actual</h3>
            </div>

            <div className="current-role-card">
              <div className="current-role-info">
                <span className={`role-badge role-${user?.role}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                  {getRoleName(user?.role)}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                  {user?.role === 'viewer' && 'Puedes ver el Dashboard y las Métricas del sistema.'}
                  {user?.role === 'operator' && 'Puedes gestionar Dispositivos, Ubicaciones, Métricas y Alertas.'}
                  {user?.role === 'admin' && 'Tienes acceso total al sistema.'}
                </p>
              </div>
            </div>

            {user?.role === 'admin' ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>🎉 ¡Ya tienes el nivel de acceso máximo!</p>
              </div>
            ) : hasPending ? (
              <div className="request-pending-banner">
                <div className="request-pending-icon">⏳</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Solicitud Pendiente</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Ya tienes una solicitud en espera de aprobación. El administrador la revisará pronto.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <div className="form-group">
                  <label className="form-label">Rol Solicitado</label>
                  <div className="role-selector">
                    {availableRoles.map((r) => (
                      <div
                        key={r.value}
                        className={`role-option ${selectedRole === r.value ? 'selected' : ''}`}
                        onClick={() => setSelectedRole(r.value)}
                      >
                        <div className="role-option-icon">{r.icon}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  id="btn-send-role-request"
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  disabled={sending || !selectedRole}
                >
                  {sending ? <span className="spinner" /> : '📤'} {sending ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            )}
          </div>

          {/* Historial de solicitudes */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Historial de Solicitudes</h3>
              <span className="badge badge-info">{myRequests.length} total</span>
            </div>

            {loading ? (
              <div className="loading-overlay" style={{ padding: '30px 0' }}>
                <div className="spinner" />
                <span>Cargando...</span>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>No has realizado ninguna solicitud aún.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myRequests.map((req) => (
                  <div key={req.id} className="request-history-item">
                    <div className="request-history-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`role-badge role-${req.current_role}`} style={{ fontSize: 10 }}>
                          {getRoleName(req.current_role)}
                        </span>
                        <span className="role-change-arrow">→</span>
                        <span className={`role-badge role-${req.requested_role}`} style={{ fontSize: 10 }}>
                          {getRoleName(req.requested_role)}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('es-CO') : ''}
                      </span>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
