import CrudPage from '../components/CrudPage'
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'type', label: 'Tipo' },
  { key: 'serial', label: 'Serial' },
  { key: 'status', label: 'Estado', render: (v) => {
    const map = { active: 'badge-success', inactive: 'badge-danger', maintenance: 'badge-warning' }
    return <span className={`badge ${map[v] || 'badge-info'}`}>{v || 'N/A'}</span>
  }},
  { key: 'location_id', label: 'Ubicación ID' },
]

const fields = [
  { key: 'name', label: 'Nombre del dispositivo', required: true, placeholder: 'ej: Monitor Cardíaco #1' },
  { key: 'type', label: 'Tipo de dispositivo', required: true, placeholder: 'ej: Monitor, Ventilador, Bomba...' },
  { key: 'serial', label: 'Número de serie', placeholder: 'SN-0001' },
  { key: 'status', label: 'Estado', type: 'select', options: [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'maintenance', label: 'En mantenimiento' },
  ]},
  { key: 'location_id', label: 'ID de Ubicación', type: 'number', placeholder: 'ID de la sala asignada' },
]

export default function DevicesPage() {
  return (
    <CrudPage
      title="Dispositivos"
      subtitle="Equipos médicos conectados al sistema de monitoreo"
      icon="📡"
      fetchFn={getDevices}
      createFn={createDevice}
      updateFn={updateDevice}
      deleteFn={deleteDevice}
      columns={columns}
      fields={fields}
      emptyLabel="Registra los equipos médicos a monitorear."
    />
  )
}
