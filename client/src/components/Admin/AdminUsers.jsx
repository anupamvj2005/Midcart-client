import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/users${search ? `?search=${search}` : ''}`)
      .then(({ data }) => setUsers(data?.users || []))
      .catch((err) => {
        console.error("Failed to fetch admin users", err)
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [search])

  const toggleStatus = async (user) => {
    await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive })
    toast.success('User updated')
    setUsers(us => us.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u))
  }

  const changeRole = async (user, role) => {
    await api.put(`/admin/users/${user._id}`, { role })
    setUsers(us => us.map(u => u._id === user._id ? { ...u, role } : u))
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Users</h1>
      <input type="text" className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:300, marginBottom:16 }} />
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign:'center', padding:32 }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
            : users?.map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <select className="input" style={{ fontSize:'0.78rem', padding:'4px 8px', width:'auto' }} value={u.role} onChange={e => changeRole(u, e.target.value)}>
                    {['user','pharmacist','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleStatus(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
