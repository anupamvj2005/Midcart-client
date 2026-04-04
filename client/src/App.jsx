import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Navbar from './components/Navbar/Navbar'
import BottomMobileNav from './components/Navbar/BottomMobileNav'
import Footer from './components/Navbar/Footer'

import Home from './components/Home/Home'
import Products from './components/Products/Products'
import ProductDetail from './components/Products/ProductDetail'
import Cart from './components/Cart/Cart'
import Checkout from './components/Cart/Checkout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import UserDashboard from './components/Dashboard/UserDashboard'
import MyOrders from './components/Orders/MyOrders'
import OrderDetail from './components/Orders/OrderDetail'
import PrescriptionUpload from './components/Prescription/PrescriptionUpload'
import MyPrescriptions from './components/Prescription/MyPrescriptions'

// Admin pages
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminProducts from './components/Admin/AdminProducts'
import AdminOrders from './components/Admin/AdminOrders'
import AdminPrescriptions from './components/Admin/AdminPrescriptions'
import AdminAnalytics from './components/Admin/AdminAnalytics'
import AdminUsers from './components/Admin/AdminUsers'
import MLInsights from './components/Admin/MLInsights'

import useAuthStore from './context/authStore'

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#00a651', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Admin routes — no main navbar */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="ml-insights" element={<MLInsights />} />
        </Route>

        {/* Public + user routes */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/prescriptions" element={<ProtectedRoute><MyPrescriptions /></ProtectedRoute>} />
              <Route path="/prescriptions/upload" element={<ProtectedRoute><PrescriptionUpload /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <BottomMobileNav />
          </>
        } />
      </Routes>
    </Router>
  )
}
