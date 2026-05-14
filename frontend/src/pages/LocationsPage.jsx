import CrudPage from '../components/CrudPage'
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'floor', label: 'Piso/Área' },
  { key: 'building', label: 'Edificio' },
  { key: 'capacity', label: 'Capacidad' },
]

const fields = [
  { key: 'name', label: 'Nombre de la ubicación', required: true, placeholder: 'ej: UCI Pediátrica' },
  { key: 'floor', label: 'Piso / Área', placeholder: 'ej: Piso 3, Ala Norte' },
  { key: 'building', label: 'Edificio', placeholder: 'ej: Torre A' },
  { key: 'capacity', label: 'Capacidad (camas/puestos)', type: 'number', placeholder: '20' },
]

export default function LocationsPage() {
  return (
    <CrudPage
      title="Ubicaciones"
      subtitle="Salas, pisos y áreas del hospital"
      icon="📍"
      fetchFn={getLocations}
      createFn={createLocation}
      updateFn={updateLocation}
      deleteFn={deleteLocation}
      columns={columns}
      fields={fields}
      emptyLabel="Registra las salas y áreas del hospital."
    />
  )
}
