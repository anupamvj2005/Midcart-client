import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingBag, FiFileText, FiBarChart2, FiUsers, FiCpu, FiLogOut, FiX, FiMenu } from 'react-icons/fi'
import { useState } from 'react'
import useAuthStore from '../../context/authStore'
import styles from './Admin.module.css'

const NAV_ITEMS = [
  { to: '/admin', end: true, icon: <FiGrid />, label: 'Dashboard' },
  { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
  { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
  { to: '/admin/prescriptions', icon: <FiFileText />, label: 'Prescriptions' },
  { to: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/ml-insights', icon: <FiCpu />, label: 'ML Insights' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>💊 <strong>Admin</strong></div>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className={styles.adminName}>{user?.name}</p>
              <p className={styles.adminRole}>{user?.role}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}><FiLogOut /></button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}><FiMenu size={22} /></button>
          <div className={styles.topbarRight}>
            <a href="/" className={styles.viewSite}>← View Site</a>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
