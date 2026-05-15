import CrudPage from '../components/CrudPage'
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'building', label: 'Edificio' },
  { key: 'floor', label: 'Piso' },
  { key: 'room', label: 'Habitación/Sala' },
]

const fields = [
  { key: 'name', label: 'Nombre de la ubicación', required: true, placeholder: 'ej: UCI Pediátrica' },
  { key: 'building', label: 'Edificio', placeholder: 'ej: Torre A' },
  { key: 'floor', label: 'Piso', placeholder: 'ej: Piso 3' },
  { key: 'room', label: 'Habitación / Sala', placeholder: 'ej: Sala 302' },
  { key: 'description', label: 'Descripción', placeholder: 'Opcional' },
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
