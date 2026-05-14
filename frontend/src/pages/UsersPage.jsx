import CrudPage from '../components/CrudPage'
import { getUsers, createUser, updateUser, deleteUser } from '../api'

const columns = [
  { key: 'username', label: 'Usuario' },
  { key: 'email', label: 'Correo' },
  { key: 'document', label: 'Documento' },
  { key: 'role', label: 'Rol', render: (v) => v ? <span className="badge badge-info">{v}</span> : <span className="td-muted">—</span> },
]

const fields = [
  { key: 'username', label: 'Nombre de usuario', required: true, placeholder: 'ej: juan.perez' },
  { key: 'email', label: 'Correo electrónico', type: 'email', required: true, placeholder: 'correo@hospital.com' },
  { key: 'document', label: 'Documento', placeholder: 'Número de identificación' },
  { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
  { key: 'role', label: 'Rol', type: 'select', options: [
    { value: 'admin', label: 'Administrador' },
    { value: 'medico', label: 'Médico' },
    { value: 'enfermero', label: 'Enfermero' },
    { value: 'tecnico', label: 'Técnico' },
  ]},
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
