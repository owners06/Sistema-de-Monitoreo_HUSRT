import { useEffect, useState } from 'react'
import { getDevices, getAlerts, getMetrics, getUsers, getLocations } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({ devices: 0, alerts: 0, metrics: 0, users: 0, locations: 0 })
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [devRes, alRes, meRes, usRes, loRes] = await Promise.allSettled([
          getDevices(), getAlerts(), getMetrics(), getUsers(), getLocations()
        ])
        const devices = devRes.status === 'fulfilled' ? devRes.value.data : []
        const alerts = alRes.status === 'fulfilled' ? alRes.value.data : []
        const metrics = meRes.status === 'fulfilled' ? meRes.value.data : []
        const users = usRes.status === 'fulfilled' ? usRes.value.data : []
        const locations = loRes.status === 'fulfilled' ? loRes.value.data : []

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

  const statCards = [
    { label: 'Dispositivos', value: stats.devices, icon: '📡', cls: 'blue', sub: 'Equipos registrados' },
    { label: 'Alertas', value: stats.alerts, icon: '🚨', cls: 'red', sub: 'Total en el sistema' },
    { label: 'Métricas', value: stats.metrics, icon: '📊', cls: 'green', sub: 'Registros de datos' },
    { label: 'Usuarios', value: stats.users, icon: '👤', cls: 'amber', sub: 'Personal registrado' },
  ]

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">Panel de Control</p>
          <p className="topbar-subtitle">Resumen general del sistema hospitalario</p>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-success">
            <span className="badge-dot" style={{ animation: 'pulse 2s infinite' }} />
            Sistema Operativo
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Stat Cards */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
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

        <div className="grid grid-2">
          {/* Alertas Recientes */}
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

          {/* Info del Sistema */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏥 Resumen del Sistema</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Ubicaciones registradas', value: stats.locations, icon: '📍' },
                { label: 'Dispositivos activos', value: stats.devices, icon: '📡' },
                { label: 'Total de métricas', value: stats.metrics, icon: '📊' },
                { label: 'Personal del sistema', value: stats.users, icon: '👥' },
              ].map((item) => (
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
