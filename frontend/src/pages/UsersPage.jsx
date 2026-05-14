import CrudPage from '../components/CrudPage'
import { getUsers, createUser, updateUser, deleteUser } from '../api'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'document', label: 'Documento' },
  { key: 'phone', label: 'Teléfono' },
]

const fields = [
  { key: 'name', label: 'Nombre completo', required: true, placeholder: 'ej: Juan Pérez' },
  { key: 'document', label: 'Documento', required: true, placeholder: 'Número de identificación' },
  { key: 'phone', label: 'Teléfono', required: true, placeholder: 'ej: 3001234567' },
]

export default function UsersPage() {
  return (
    <CrudPage
      title="Usuarios"
      subtitle="Gestión del personal registrado en el sistema"
      icon="👤"
      fetchFn={getUsers}
      createFn={createUser}
      updateFn={updateUser}
      deleteFn={deleteUser}
      columns={columns}
      fields={fields}
      emptyLabel="Registra al personal médico y administrativo."
    />
  )
}
