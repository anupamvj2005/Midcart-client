import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, FileText, User, Settings, LogOut, ChevronRight, Activity, Clock } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function UserDashboard() {
  const { user, updateUser, logout } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/orders/my?limit=5')
      .then(({ data }) => setOrders(data?.orders || []))
      .catch((err) => {
        console.error("User Dashboard orders fetch failed", err)
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data.user)
      toast.success('Profile updated successfully!')
    } catch { toast.error('Update failed. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="pt-[72px] pb-20 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account, orders, and health records.</p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-extrabold text-3xl mb-4">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              
              <div className="w-full h-px bg-gray-100 my-6"></div>
              
              <div className="w-full flex flex-col gap-2">
                <Link to="/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3 font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    <Package size={18} /> My Orders
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/prescriptions" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3 font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    <FileText size={18} /> Prescriptions
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3 font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    <Settings size={18} /> Settings
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
              <Activity className="text-brandBlue shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Health Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">Track your vitals and upcoming checkups.</p>
                <button className="text-xs font-bold text-white bg-brandBlue px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors shadow-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" /> Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-70 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-primary" /> Recent Orders
                </h3>
                <Link to="/orders" className="text-primary font-semibold text-sm hover:text-primary-dark transition-colors">View All</Link>
              </div>
              
              <div className="p-0">
                {loading ? (
                  <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Package size={40} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="text-gray-900 font-bold mb-1">No orders yet</h4>
                    <p className="text-gray-500 text-sm mb-6">Looks like you haven't placed an order yet.</p>
                    <Link to="/products" className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {orders?.map(o => (
                      <li key={o._id} className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">Order #{o.orderNumber}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                            <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{o.items?.length} Item{o.items?.length !== 1 ? 's' : ''}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className={`capitalize font-bold ${o.status === 'delivered' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'}`}>{o.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:justify-end">
                          <span className="font-extrabold text-gray-900 text-lg">₹{o.pricing?.total?.toFixed(2)}</span>
                          <Link to={`/orders/${o._id}`} className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                            View Details
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
