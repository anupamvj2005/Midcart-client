import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { 
  ShoppingCart, User, Menu, X, Search, UploadCloud, 
  LogOut, Package, LayoutGrid, MapPin, ChevronDown, Navigation
} from 'lucide-react'
import useAuthStore from '../../context/authStore'
import useCartStore from '../../context/cartStore'

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [location, setLocation] = useState({ city: 'Mumbai', pincode: '400001' })
  const [newCity, setNewCity] = useState('')
  const [newPincode, setNewPincode] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const dropdownRef = useRef(null)

  const itemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0

  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Hyderabad', 'Jaipur', 'Nashik'
  ]

  useEffect(() => {
    if (isLoggedIn()) fetchCart()
  }, [isLoggedIn()])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setLocation(parsed)
      } catch (error) {
        console.error('Error parsing saved location:', error)
      }
    }
  }, [])

  const saveLocation = (city, pincode) => {
    const newLocation = { city, pincode }
    setLocation(newLocation)
    localStorage.setItem('userLocation', JSON.stringify(newLocation))
  }

  const handleLocationSave = () => {
    const city = selectedCity || newCity.trim()
    const pincode = newPincode.trim()

    if (!city) {
      alert('Please select or enter a city')
      return
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    saveLocation(city, pincode)
    setLocationModalOpen(false)
    setNewCity('')
    setNewPincode('')
    setSelectedCity('')
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // For now, just show coordinates. In a real app, you'd use a reverse geocoding API
        alert(`Location detected: ${latitude}, ${longitude}\n\nIn a production app, this would be converted to city/pincode using a geocoding service.`)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please enter manually.')
      }
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        
        {/* Logo & Location (Left) */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Mid<span className="text-primary">Cart</span>
            </span>
          </Link>
          
          <div 
            className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-primary cursor-pointer transition-colors"
            onClick={() => setLocationModalOpen(true)}
          >
            <MapPin size={16} className="text-primary" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Delivering to</p>
              <p className="font-medium flex items-center gap-1">{location.city} {location.pincode} <ChevronDown size={14} /></p>
            </div>
          </div>
        </div>

        {/* Search Bar (Middle) */}
        <div className="flex-grow max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for medicines, health products and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
            />
            <button 
              type="submit" 
              className="absolute inset-y-1 right-1 px-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Quick Actions */}
          <Link to="/products" className="hidden lg:block text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Medicines
          </Link>
          <Link to="/prescriptions/upload" className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            <UploadCloud size={18} />
            <span className="whitespace-nowrap">Upload Rx</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1 text-gray-700 hover:text-primary transition-colors p-1">
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isLoggedIn() ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold max-w-[100px] truncate text-gray-700">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {/* Dropdown Options */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    <Package size={16} /> My Orders
                  </Link>
                  <Link to="/prescriptions" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    <UploadCloud size={16} /> Prescriptions
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary-light transition-colors">
                      <LayoutGrid size={16} /> Admin Panel
                    </Link>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar (Visible only on mobile) */}
      <div className="md:hidden px-4 pb-3 pt-1 bg-white border-t border-gray-50">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-primary outline-none"
          />
        </form>
      </div>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Select Delivery Location</h3>
              <button 
                onClick={() => setLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Popular Cities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popular Cities</label>
                <div className="grid grid-cols-2 gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedCity === city
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom City Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter City</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {/* Pincode Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  maxLength={6}
                />
              </div>

              {/* Use Current Location */}
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
              >
                <Navigation size={16} />
                Use Current Location
              </button>

              {/* Save Button */}
              <button
                onClick={handleLocationSave}
                className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
