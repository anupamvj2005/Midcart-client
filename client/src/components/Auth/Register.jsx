import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi'
import useAuthStore from '../../context/authStore'
import styles from './Auth.module.css'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    try {
      await register(form.name, form.email, form.password, form.phone)
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
          <h1>Create Account</h1>
          <p>Join SmartPharma & save on medicines</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={submit} className={styles.form}>
          {[
            { icon: <FiUser />, name: 'name', type: 'text', placeholder: 'Full Name', required: true },
            { icon: <FiMail />, name: 'email', type: 'email', placeholder: 'Email Address', required: true },
            { icon: <FiPhone />, name: 'phone', type: 'tel', placeholder: 'Mobile Number (optional)', required: false },
            { icon: <FiLock />, name: 'password', type: 'password', placeholder: 'Password (min 6 chars)', required: true },
          ].map(f => (
            <div key={f.name} className="form-group">
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>{f.icon}</span>
                <input
                  type={f.type} name={f.name} required={f.required}
                  placeholder={f.placeholder}
                  className={`input ${styles.inputPadded}`}
                  value={form[f.name]} onChange={handle}
                />
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}
