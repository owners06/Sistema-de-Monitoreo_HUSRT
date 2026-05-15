import CrudPage from '../components/CrudPage'
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'model', label: 'Modelo' },
  { key: 'location_id', label: 'Ubicación ID' },
  { key: 'device_type_id', label: 'Tipo ID', render: (v) => v || 'N/A' },
]

const fields = [
  { key: 'name', label: 'Nombre del dispositivo', required: true, placeholder: 'ej: Monitor Cardíaco #1' },
  { key: 'model', label: 'Modelo/Marca', required: true, placeholder: 'ej: Philips IntelliVue' },
  { key: 'location_id', label: 'ID de Ubicación', type: 'number', required: true, placeholder: 'ID de la sala asignada' },
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
