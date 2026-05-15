import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AuthContext = createContext(null)

/**
 * Decodifica un JWT (sin verificar firma — solo lectura del payload).
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Lee el usuario actual del localStorage/token.
 */
function loadUserFromStorage() {
  const token = localStorage.getItem('token')
  if (!token) return null

  const payload = parseJwt(token)
  if (!payload) return null

  // Verificar expiración
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }

  return {
    id: payload.user_id,
    email: payload.email,
    username: payload.username || payload.email,
    role: payload.role || 'viewer',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUserFromStorage())

  const isLoggedIn = !!user
  const isAdmin = user?.role === 'admin'
  const isOperator = user?.role === 'operator'
  const isViewer = user?.role === 'viewer'

  const handleLogin = useCallback((token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', userData?.username || userData?.email || '')

    const payload = parseJwt(token)
    const userObj = {
      id: payload?.user_id || userData?.id,
      email: payload?.email || userData?.email,
      username: payload?.username || userData?.username || userData?.email,
      role: payload?.role || userData?.role || 'viewer',
    }
    setUser(userObj)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  /**
   * Verifica si el usuario actual tiene acceso al rol mínimo requerido.
   * admin > operator > viewer
   */
  const hasAccess = useCallback(
    (requiredRole) => {
      if (!user) return false
      const hierarchy = { admin: 3, operator: 2, viewer: 1 }
      return (hierarchy[user.role] || 0) >= (hierarchy[requiredRole] || 0)
    },
    [user]
  )

  const getRoleName = useCallback((role) => {
    const names = {
      admin: 'Administrador',
      operator: 'Operador',
      viewer: 'Visor',
    }
    return names[role] || role
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      isAdmin,
      isOperator,
      isViewer,
      login: handleLogin,
      logout: handleLogout,
      hasAccess,
      getRoleName,
    }),
    [user, isLoggedIn, isAdmin, isOperator, isViewer, handleLogin, handleLogout, hasAccess, getRoleName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
