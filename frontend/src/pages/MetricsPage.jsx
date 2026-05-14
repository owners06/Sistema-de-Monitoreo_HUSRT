import CrudPage from '../components/CrudPage'
import { getMetrics, createMetric, updateMetric, deleteMetric } from '../api'

const columns = [
  { key: 'device_id', label: 'Dispositivo ID', render: (v) => <span className="badge badge-info">ID: {v || '—'}</span> },
  { key: 'metric_type', label: 'Tipo' },
  { key: 'value', label: 'Valor', render: (v) => <strong style={{ color: 'var(--primary)' }}>{v}</strong> },
  { key: 'unit', label: 'Unidad' },
  { key: 'timestamp', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
]

const fields = [
  { key: 'device_id', label: 'ID del Dispositivo', type: 'number', required: true, placeholder: 'ID del equipo médico' },
  { key: 'metric_type', label: 'Tipo de métrica', required: true, placeholder: 'ej: Temperatura, Presión, FC...' },
  { key: 'value', label: 'Valor', type: 'number', required: true, placeholder: 'ej: 98.6' },
  { key: 'unit', label: 'Unidad', placeholder: 'ej: °C, mmHg, bpm, %' },
]

export default function MetricsPage() {
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
