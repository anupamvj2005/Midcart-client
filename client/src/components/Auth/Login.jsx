import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import useAuthStore from '../../context/authStore'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1>Welcome Back</h1>
          <p>Login to your SmartPharma account</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={submit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email" name="email" required
                placeholder="you@example.com"
                className={`input ${styles.inputPadded}`}
                value={form.email} onChange={handle}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showPw ? 'text' : 'password'} name="password" required
                placeholder="Enter your password"
                className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                value={form.password} onChange={handle}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className={styles.demo}>
          <p>Demo Credentials:</p>
          <button onClick={() => setForm({ email: 'admin@smartpharma.com', password: 'Admin@123' })} className={styles.demoBtn}>Admin</button>
          <button onClick={() => setForm({ email: 'user@smartpharma.com', password: 'User@123' })} className={styles.demoBtn}>User</button>
        </div>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}
