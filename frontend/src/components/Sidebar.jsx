import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { label: 'GESTIÓN', type: 'section' },
  { to: '/users', label: 'Usuarios', icon: '👤' },
  { to: '/devices', label: 'Dispositivos', icon: '📡' },
  { to: '/locations', label: 'Ubicaciones', icon: '📍' },
  { label: 'MONITOREO', type: 'section' },
  { to: '/metrics', label: 'Métricas', icon: '📊' },
  { to: '/alerts', label: 'Alertas', icon: '🚨' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('user') || 'Usuario'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
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
            id={`nav-${item.label.toLowerCase()}`}
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
            <span>Sesión activa</span>
          </div>
          <button id="btn-logout" className="logout-btn" title="Cerrar sesión" onClick={handleLogout}>⏻</button>
        </div>
      </div>
    </aside>
  )
}
