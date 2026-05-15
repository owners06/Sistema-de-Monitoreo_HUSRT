import { useState, useEffect } from 'react'
import { getAuthUsers, updateAuthUserRole, deleteAuthUser } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const ROLES = [
  { value: 'viewer', label: 'Visor', color: 'role-viewer' },
  { value: 'operator', label: 'Operador', color: 'role-operator' },
  { value: 'admin', label: 'Administrador', color: 'role-admin' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'role' | 'delete'
  const [selected, setSelected] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [saving, setSaving] = useState(false)
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getAuthUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      toast('Error al cargar cuentas', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openRoleModal = (user) => {
    setSelected(user)
    setNewRole(user.role)
    setModal('role')
  }

  const openDeleteModal = (user) => {
    setSelected(user)
    setModal('delete')
  }

  const closeModal = () => { setModal(null); setSelected(null); setNewRole('') }

  const handleUpdateRole = async () => {
    if (!selected || newRole === selected.role) return closeModal()
    setSaving(true)
    try {
      await updateAuthUserRole(selected.id, { role: newRole })
      toast(`Rol actualizado a "${ROLES.find(r => r.value === newRole)?.label}"`, 'success')
      closeModal()
      load()
    } catch (err) {
      toast(err.response?.data?.error || 'Error al actualizar rol', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await deleteAuthUser(selected.id)
      toast('Cuenta eliminada', 'success')
      closeModal()
      load()
    } catch (err) {
      toast(err.response?.data?.error || 'Error al eliminar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role) => {
    const r = ROLES.find(x => x.value === role) || { label: role, color: 'role-viewer' }
    return <span className={`role-badge ${r.color}`}>{r.label}</span>
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">🔐 Gestión de Cuentas</p>
          <p className="topbar-subtitle">Administra las cuentas de acceso al sistema y sus roles</p>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-info" style={{ fontSize: 13 }}>{users.length} cuentas</span>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><span>Cargando cuentas...</span></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🔐</div>
              <h3>Sin cuentas registradas</h3>
              <p>No hay cuentas de usuario en el sistema.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td className="td-muted">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                            {(u.username || u.email)[0]?.toUpperCase()}
                          </div>
                          {u.username || u.email}
                        </div>
                      </td>
                      <td className="td-muted">{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-icon" title="Cambiar rol" onClick={() => openRoleModal(u)}>🛡️</button>
                          {u.id !== currentUser?.id && (
                            <button className="btn-icon danger" title="Eliminar cuenta" onClick={() => openDeleteModal(u)}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cambiar Rol */}
      {modal === 'role' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🛡️ Cambiar Rol</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Usuario: <strong style={{ color: 'var(--text-primary)' }}>{selected.username || selected.email}</strong>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Rol actual: {getRoleBadge(selected.role)}
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Nuevo Rol</label>
              <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)} id="select-new-role">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="role-descriptions">
              <div className={`role-desc-item ${newRole === 'viewer' ? 'active' : ''}`}>
                <strong>👁️ Visor</strong>
                <span>Solo puede ver el Dashboard y las Métricas</span>
              </div>
              <div className={`role-desc-item ${newRole === 'operator' ? 'active' : ''}`}>
                <strong>⚙️ Operador</strong>
                <span>Dashboard + Dispositivos, Ubicaciones, Métricas, Alertas</span>
              </div>
              <div className={`role-desc-item ${newRole === 'admin' ? 'active' : ''}`}>
                <strong>🔐 Administrador</strong>
                <span>Acceso total al sistema y gestión de cuentas</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdateRole} disabled={saving || newRole === selected.role}>
                {saving ? <span className="spinner" /> : null} {saving ? 'Guardando...' : 'Actualizar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Eliminar Cuenta</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              ¿Estás seguro de que quieres eliminar la cuenta de <strong style={{ color: 'var(--text-primary)' }}>{selected.username || selected.email}</strong>?
              Esta acción <strong style={{ color: 'var(--danger)' }}>no se puede deshacer</strong>.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button id="btn-confirm-delete-auth" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <span className="spinner" /> : null} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
