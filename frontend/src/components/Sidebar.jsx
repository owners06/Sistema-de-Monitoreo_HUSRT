import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, isAdmin, hasAccess, getRoleName, logout } = useAuth()
  const username = user?.username || localStorage.getItem('user') || 'Usuario'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Construir navegación dinámica según el rol
  const nav = []

  // Dashboard siempre visible
  nav.push({ to: '/', label: 'Dashboard', icon: '🏠', exact: true })

  // Sección GESTIÓN — solo admin y operator
  if (hasAccess('operator')) {
    nav.push({ label: 'GESTIÓN', type: 'section' })

    if (isAdmin) {
      nav.push({ to: '/users', label: 'Usuarios', icon: '👤' })
    }
    nav.push({ to: '/devices', label: 'Dispositivos', icon: '📡' })
    nav.push({ to: '/locations', label: 'Ubicaciones', icon: '📍' })
  }

  // Sección MONITOREO — siempre visible (viewer ve métricas solo lectura)
  nav.push({ label: 'MONITOREO', type: 'section' })
  nav.push({ to: '/metrics', label: 'Métricas', icon: '📊' })

  if (hasAccess('operator')) {
    nav.push({ to: '/alerts', label: 'Alertas', icon: '🚨' })
  }

  // Sección ADMINISTRACIÓN — solo admin
  if (isAdmin) {
    nav.push({ label: 'ADMINISTRACIÓN', type: 'section' })
    nav.push({ to: '/admin/users', label: 'Gestión de Cuentas', icon: '🔐' })
    nav.push({ to: '/admin/role-requests', label: 'Solicitudes de Rol', icon: '📋' })
  }

  // Solicitar rol — visible para viewer y operator (no admin)
  if (!isAdmin) {
    nav.push({ label: 'MI CUENTA', type: 'section' })
    nav.push({ to: '/request-role', label: 'Solicitar Rol', icon: '📤' })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏥</div>
        <div className="sidebar-logo-text">
          <h2>HUSRT</h2>
          <span>Monitoreo Hospitalario</span>
        </div>
      </div>

      {nav.map((item, i) => {
        if (item.type === 'section') return <p key={i} className="nav-section-label">{item.label}</p>
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        )
      })}

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{username[0]?.toUpperCase()}</div>
          <div className="user-info">
            <p>{username}</p>
            <span className={`role-badge-small role-${user?.role || 'viewer'}`}>
              {getRoleName(user?.role || 'viewer')}
            </span>
          </div>
          <button id="btn-logout" className="logout-btn" title="Cerrar sesión" onClick={handleLogout}>⏻</button>
        </div>
      </div>
    </aside>
  )
}
