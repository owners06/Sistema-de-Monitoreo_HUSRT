import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: agrega el JWT a cada petición protegida
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: si el token expiró, redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es 401 y NO estamos en la página de login, redirigimos
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')

// ─── AUTH USERS (admin) ──────────────────────────────────────────────
export const getAuthUsers = () => api.get('/auth/users')
export const updateAuthUserRole = (id, data) => api.put(`/auth/users/${id}/role`, data)
export const deleteAuthUser = (id) => api.delete(`/auth/users/${id}`)

// ─── ROLE REQUESTS ───────────────────────────────────────────────────
export const createRoleRequest = (data) => api.post('/auth/role-requests', data)
export const getRoleRequests = () => api.get('/auth/role-requests')
export const getMyRoleRequests = () => api.get('/auth/role-requests/mine')
export const approveRoleRequest = (id) => api.put(`/auth/role-requests/${id}/approve`)
export const rejectRoleRequest = (id) => api.put(`/auth/role-requests/${id}/reject`)

// ─── USERS ───────────────────────────────────────────────────────────
export const getUsers = () => api.get('/users')
export const getUser = (id) => api.get(`/users/${id}`)
export const getUserByDocument = (doc) => api.get(`/users/document/${doc}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// ─── DEVICES ─────────────────────────────────────────────────────────
export const getDevices = () => api.get('/devices')
export const getDevice = (id) => api.get(`/devices/${id}`)
export const createDevice = (data) => api.post('/devices', data)
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data)
export const deleteDevice = (id) => api.delete(`/devices/${id}`)

// ─── LOCATIONS ───────────────────────────────────────────────────────
export const getLocations = () => api.get('/locations')
export const getLocation = (id) => api.get(`/locations/${id}`)
export const createLocation = (data) => api.post('/locations', data)
export const updateLocation = (id, data) => api.put(`/locations/${id}`, data)
export const deleteLocation = (id) => api.delete(`/locations/${id}`)

// ─── METRICS ─────────────────────────────────────────────────────────
export const getMetrics = () => api.get('/metrics')
export const getMetric = (id) => api.get(`/metrics/${id}`)
export const createMetric = (data) => api.post('/metrics', data)
export const updateMetric = (id, data) => api.put(`/metrics/${id}`, data)
export const deleteMetric = (id) => api.delete(`/metrics/${id}`)

// ─── ALERTS ──────────────────────────────────────────────────────────
export const getAlerts = () => api.get('/alerts')
export const getAlert = (id) => api.get(`/alerts/${id}`)
export const getAlertsByDevice = (deviceId) => api.get(`/alerts/device/${deviceId}`)
export const createAlert = (data) => api.post('/alerts', data)
export const updateAlert = (id, data) => api.put(`/alerts/${id}`, data)
export const deleteAlert = (id) => api.delete(`/alerts/${id}`)

export default api
