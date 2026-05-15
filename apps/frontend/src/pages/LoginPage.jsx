import { useState } from 'react'
import { login, register } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const toast = useToast()
  const { login: authLogin } = useAuth()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrors({})
    if (!loginForm.username) return setErrors({ username: 'Requerido' })
    if (!loginForm.password) return setErrors({ password: 'Requerido' })
    setLoading(true)
    try {
      const { data } = await login({ email: loginForm.username, password: loginForm.password })
      const token = data.token || data.access_token
      authLogin(token, data.user)
      toast('Sesión iniciada correctamente', 'success')
    } catch (err) {
      const msg = err.response?.data?.error || 'Credenciales inválidas'
      setErrors({ login: msg })
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrors({})
    if (registerForm.password !== registerForm.confirmPassword)
      return setErrors({ confirmPassword: 'Las contraseñas no coinciden' })
    setLoading(true)
    try {
      await register({ username: registerForm.username, email: registerForm.email, password: registerForm.password })
      toast('Cuenta creada. Ahora puedes iniciar sesión.', 'success')
      setTab('login')
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar'
      setErrors({ register: msg })
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏥</div>
          <div>
            <h1>HUSRT</h1>
            <span>Sistema de Monitoreo Hospitalario</span>
          </div>
        </div>

        <div className="login-tabs">
          <button id="tab-login" className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Iniciar Sesión
          </button>
          <button id="tab-register" className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Registrarse
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                id="login-username"
                className="form-input"
                type="text"
                placeholder="correo@hospital.com"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>
            <button id="btn-login" className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" /> : '→'} {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>

            {errors.login && (
              <div className="login-error-message" style={{ 
                marginTop: '16px', 
                padding: '10px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--danger)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                ✕ {errors.login}
              </div>
            )}

          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input id="reg-username" className="form-input" type="text" placeholder="Elige un nombre de usuario" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input id="reg-email" className="form-input" type="email" placeholder="correo@hospital.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input id="reg-password" className="form-input" type="password" placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar</label>
                <input id="reg-confirm" className="form-input" type="password" placeholder="••••••••" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="register-info-banner">
              <span>ℹ️</span>
              <p>Al registrarte obtendrás el rol de <strong>Visor</strong> (solo métricas). Puedes solicitar un rol más avanzado una vez dentro del sistema.</p>
            </div>

            <button id="btn-register" className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" /> : '+'} {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            {errors.register && (
              <div className="login-error-message" style={{ 
                marginTop: '16px', 
                padding: '10px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--danger)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                ✕ {errors.register}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
