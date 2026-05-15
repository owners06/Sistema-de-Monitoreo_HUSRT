import { useState, useEffect } from 'react'
import { getMetrics } from '../api'
import { useToast } from '../context/ToastContext'

/**
 * Vista de solo lectura de métricas para usuarios con rol "viewer".
 * No permite crear, editar ni eliminar — solo ver la tabla.
 */
export default function MetricsReadOnlyPage() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMetrics()
        setMetrics(Array.isArray(data) ? data : [])
      } catch {
        toast('Error al cargar métricas', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">📊 Métricas</p>
          <p className="topbar-subtitle">Datos registrados por los dispositivos en tiempo real</p>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-info" style={{ fontSize: 13 }}>👁️ Solo lectura</span>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><span>Cargando métricas...</span></div>
          ) : metrics.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>📊</div>
              <h3>Sin métricas</h3>
              <p>Aún no hay métricas registradas. Los dispositivos activos las generarán automáticamente.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Dispositivo ID</th>
                    <th>Métrica</th>
                    <th>Valor</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="td-muted">{i + 1}</td>
                      <td><span className="badge badge-info">ID: {m.device_id || '—'}</span></td>
                      <td>{m.name || '—'}</td>
                      <td><strong style={{ color: 'var(--primary)' }}>{m.value}</strong></td>
                      <td className="td-muted">{m.timestamp ? new Date(m.timestamp).toLocaleString('es-CO') : '—'}</td>
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
