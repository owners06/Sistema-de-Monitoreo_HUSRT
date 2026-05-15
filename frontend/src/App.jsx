import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/UsersPage'
import DevicesPage from './pages/DevicesPage'
import LocationsPage from './pages/LocationsPage'
import MetricsPage from './pages/MetricsPage'
import AlertsPage from './pages/AlertsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import RoleRequestsPage from './pages/RoleRequestsPage'
import RequestRolePage from './pages/RequestRolePage'

/**
 * Componente que protege rutas por rol.
 * Si el usuario no tiene el rol mínimo requerido, redirige al dashboard.
 */
function RoleGuard({ requiredRole, children }) {
  const { hasAccess } = useAuth()
  if (!hasAccess(requiredRole)) {
    return <Navigate to="/" replace />
  }
  return children
}

function ProtectedLayout() {
  const { isAdmin } = useAuth()

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Gestión — requiere operator o admin */}
          <Route path="/users" element={<RoleGuard requiredRole="admin"><UsersPage /></RoleGuard>} />
          <Route path="/devices" element={<RoleGuard requiredRole="operator"><DevicesPage /></RoleGuard>} />
          <Route path="/locations" element={<RoleGuard requiredRole="operator"><LocationsPage /></RoleGuard>} />

          {/* Monitoreo — métricas visible para todos, alertas para operator+ */}
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/alerts" element={<RoleGuard requiredRole="operator"><AlertsPage /></RoleGuard>} />

          {/* Admin — solo admin */}
          <Route path="/admin/users" element={<RoleGuard requiredRole="admin"><AdminUsersPage /></RoleGuard>} />
          <Route path="/admin/role-requests" element={<RoleGuard requiredRole="admin"><RoleRequestsPage /></RoleGuard>} />

          {/* Solicitar Rol — cualquier usuario logueado */}
          <Route path="/request-role" element={<RequestRolePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { isLoggedIn } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={isLoggedIn ? <ProtectedLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
