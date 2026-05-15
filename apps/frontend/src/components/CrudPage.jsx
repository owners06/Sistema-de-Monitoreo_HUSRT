import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

/**
 * CrudPage - componente reutilizable para todas las entidades CRUD
 * Props:
 *  - title, subtitle, icon
 *  - fetchFn, createFn, updateFn, deleteFn (funciones de api.js)
 *  - columns: [{ key, label, render? }]
 *  - fields: [{ key, label, type, required, placeholder }]
 *  - emptyLabel
 */
export default function CrudPage({ title, subtitle, icon, fetchFn, createFn, updateFn, deleteFn, columns, fields, emptyLabel }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await fetchFn()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({})
    setSelected(null)
    setModal('create')
  }

  const openEdit = (item) => {
    setSelected(item)
    setForm({ ...item })
    setModal('edit')
  }

  const openDelete = (item) => {
    setSelected(item)
    setModal('delete')
  }

  const closeModal = () => { setModal(null); setSelected(null); setForm({}) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const cleanForm = {}
      for (const key in form) {
        cleanForm[key] = form[key] === '' ? null : form[key]
      }
      
      if (modal === 'create') {
        await createFn(cleanForm)
        toast('Registro creado exitosamente', 'success')
      } else {
        await updateFn(selected.id, cleanForm)
        toast('Registro actualizado', 'success')
      }
      closeModal()
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteFn(selected.id)
      toast('Registro eliminado', 'success')
      closeModal()
      load()
    } catch {
      toast('Error al eliminar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="topbar-title">{icon} {title}</p>
          <p className="topbar-subtitle">{subtitle}</p>
        </div>
        <div className="topbar-actions">
          <button id={`btn-create-${title.toLowerCase().replace(/\s/g, '-')}`} className="btn btn-primary" onClick={openCreate}>
            + Nuevo
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Cargando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
              <h3>Sin registros</h3>
              <p>{emptyLabel || `Aún no hay ${title.toLowerCase()} registrados.`}</p>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>+ Agregar el primero</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="td-muted">{idx + 1}</td>
                      {columns.map((c) => (
                        <td key={c.key}>
                          {c.render ? c.render(item[c.key], item) : (item[c.key] ?? <span className="td-muted">—</span>)}
                        </td>
                      ))}
                      <td>
                        <div className="td-actions">
                          <button className="btn-icon" title="Editar" onClick={() => openEdit(item)}>✏️</button>
                          <button className="btn-icon danger" title="Eliminar" onClick={() => openDelete(item)}>🗑️</button>
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

      {/* Modal Crear/Editar */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? `Nuevo ${title.slice(0, -1)}` : `Editar ${title.slice(0, -1)}`}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {fields.map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}{f.required && ' *'}</label>
                  {f.type === 'select' ? (
                    <select className="form-select" value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} id={`field-${f.key}`}>
                      <option value="">Seleccionar...</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      id={`field-${f.key}`}
                      className="form-input"
                      type={f.type || 'text'}
                      placeholder={f.placeholder || ''}
                      value={form[f.key] || ''}
                      required={f.required}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : null} {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Confirmar eliminación</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              ¿Estás seguro de que quieres eliminar este registro? Esta acción <strong style={{ color: 'var(--danger)' }}>no se puede deshacer</strong>.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button id="btn-confirm-delete" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <span className="spinner" /> : null} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
