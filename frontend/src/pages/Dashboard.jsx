import { useEffect, useState } from 'react'
import { getDevices, getAlerts, getMetrics, getUsers, getLocations } from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({ devices: 0, alerts: 0, metrics: 0, users: 0, locations: 0 })
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAdmin, hasAccess, getRoleName } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Todos los roles ven métricas
        const promises = [getMetrics()]

        // operator+ ven dispositivos, alertas, ubicaciones
        if (hasAccess('operator')) {
          promises.push(getDevices(), getAlerts(), getLocations())
        }

        // admin ve usuarios
        if (isAdmin) {
          promises.push(getUsers())
        }

        const results = await Promise.allSettled(promises)

        let metrics = [], devices = [], alerts = [], locations = [], users = []

        // Métricas siempre está en posición 0
        metrics = results[0]?.status === 'fulfilled' ? results[0].value.data : []

        if (hasAccess('operator')) {
          devices = results[1]?.status === 'fulfilled' ? results[1].value.data : []
          alerts = results[2]?.status === 'fulfilled' ? results[2].value.data : []
          locations = results[3]?.status === 'fulfilled' ? results[3].value.data : []
        }

        if (isAdmin) {
          const userIdx = hasAccess('operator') ? 4 : 1
          users = results[userIdx]?.status === 'fulfilled' ? results[userIdx].value.data : []
        }

        setStats({
          devices: Array.isArray(devices) ? devices.length : 0,
          alerts: Array.isArray(alerts) ? alerts.length : 0,
          metrics: Array.isArray(metrics) ? metrics.length : 0,
          users: Array.isArray(users) ? users.length : 0,
          locations: Array.isArray(locations) ? locations.length : 0,
        })
        setRecentAlerts(Array.isArray(alerts) ? alerts.slice(0, 5) : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <span>Cargando panel de control...</span>
    </div>
  )

  // Stat cards dinámicas según rol
  const statCards = []
  statCards.push({ label: 'Métricas', value: stats.metrics, icon: '📊', cls: 'green', sub: 'Registros de datos' })

  if (hasAccess('operator')) {
    statCards.push({ label: 'Dispositivos', value: stats.devices, icon: '📡', cls: 'blue', sub: 'Equipos registrados' })
    statCards.push({ label: 'Alertas', value: stats.alerts, icon: '🚨', cls: 'red', sub: 'Total en el sistema' })
    statCards.push({ label: 'Ubicaciones', value: stats.locations, icon: '📍', cls: 'amber', sub: 'Salas y áreas' })
  }

  if (isAdmin) {
    statCards.push({ label: 'Usuarios', value: stats.users, icon: '👤', cls: 'amber', sub: 'Personal registrado' })
  }

  const gridClass = statCards.length >= 4 ? 'grid-4' : statCards.length === 3 ? 'grid-3' : statCards.length === 2 ? 'grid-2' : 'grid-2'

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">Panel de Control</p>
          <p className="topbar-subtitle">Resumen general del sistema hospitalario</p>
        </div>
        <div className="topbar-actions">
          <span className={`role-badge role-${user?.role}`}>{getRoleName(user?.role)}</span>
          <span className="badge badge-success">
            <span className="badge-dot" style={{ animation: 'pulse 2s infinite' }} />
            Sistema Operativo
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Bienvenida para viewer */}
        {user?.role === 'viewer' && (
          <div className="viewer-welcome-card" style={{ marginBottom: 24 }}>
            <div className="viewer-welcome-content">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>👋 Bienvenido, {user.username}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Tu rol actual es <strong>Visor</strong>. Puedes ver el Dashboard y las Métricas del sistema.
                  Si necesitas más acceso, puedes solicitar un cambio de rol.
                </p>
              </div>
              <button className="btn btn-primary" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => navigate('/request-role')}>
                📤 Solicitar Rol
              </button>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className={`grid ${gridClass}`} style={{ marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} className="card">
              <div className="card-header">
                <p className="card-title">{s.label}</p>
                <div className={`stat-icon ${s.cls}`} style={{ fontSize: 20 }}>{s.icon}</div>
              </div>
              <p className="card-value">{s.value}</p>
              <p className="card-sub">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className={`grid ${hasAccess('operator') ? 'grid-2' : ''}`}>
          {/* Alertas Recientes — solo operator+ */}
          {hasAccess('operator') && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>🚨 Alertas Recientes</h3>
                <span className="badge badge-danger">{stats.alerts} total</span>
              </div>
              {recentAlerts.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <p>✅ Sin alertas activas</p>
                </div>
              ) : (
                recentAlerts.map((alert, i) => (
                  <div key={alert.id || i} className={`alert-item ${i % 2 === 0 ? 'critical' : 'warning'}`}>
                    <div className={`alert-dot ${i % 2 === 0 ? 'critical' : 'warning'}`} />
                    <div className="alert-info">
                      <p>{alert.message || alert.type || `Alerta #${alert.id}`}</p>
                      <span>Dispositivo ID: {alert.device_id || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Info del Sistema */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏥 Resumen del Sistema</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total de métricas', value: stats.metrics, icon: '📊', show: true },
                { label: 'Dispositivos activos', value: stats.devices, icon: '📡', show: hasAccess('operator') },
                { label: 'Ubicaciones registradas', value: stats.locations, icon: '📍', show: hasAccess('operator') },
                { label: 'Personal del sistema', value: stats.users, icon: '👥', show: isAdmin },
              ]
                .filter((item) => item.show)
                .map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
