import CrudPage from '../components/CrudPage'
import { getMetrics, createMetric, updateMetric, deleteMetric } from '../api'
import { useAuth } from '../context/AuthContext'
import MetricsReadOnlyPage from './MetricsReadOnlyPage'

const columns = [
  { key: 'device_id', label: 'Dispositivo ID', render: (v) => <span className="badge badge-info">ID: {v || '—'}</span> },
  { key: 'name', label: 'Métrica' },
  { key: 'value', label: 'Valor', render: (v) => <strong style={{ color: 'var(--primary)' }}>{v}</strong> },
  { key: 'timestamp', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
]

const fields = [
  { key: 'device_id', label: 'ID del Dispositivo', type: 'number', required: true, placeholder: 'ID del equipo médico' },
  { key: 'name', label: 'Nombre de la métrica', required: true, placeholder: 'ej: Temperatura, Presión...' },
  { key: 'value', label: 'Valor', type: 'number', required: true, placeholder: 'ej: 98.6' },
  { key: 'timestamp', label: 'Fecha y hora', type: 'datetime-local', required: true },
]

export default function MetricsPage() {
  const { hasAccess } = useAuth()

  // Viewer solo ve métricas en modo lectura (sin CRUD)
  if (!hasAccess('operator')) {
    return <MetricsReadOnlyPage />
  }

  return (
    <CrudPage
      title="Métricas"
      subtitle="Datos registrados por los dispositivos en tiempo real"
      icon="📊"
      fetchFn={getMetrics}
      createFn={createMetric}
      updateFn={updateMetric}
      deleteFn={deleteMetric}
      columns={columns}
      fields={fields}
      emptyLabel="Aún no hay métricas registradas. Los dispositivos activos las generarán automáticamente."
    />
  )
}
