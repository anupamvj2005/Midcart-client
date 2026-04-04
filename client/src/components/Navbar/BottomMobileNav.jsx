import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, UploadCloud, ShoppingCart, User } from 'lucide-react'
import useCartStore from '../../context/cartStore'

export default function BottomMobileNav() {
  const location = useLocation()
  const path = location.pathname
  const { cart } = useCartStore()
  
  const itemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/products', icon: LayoutGrid },
    { name: 'Upload Rx', path: '/prescriptions/upload', icon: UploadCloud },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, count: itemCount },
    { name: 'Profile', path: '/dashboard', icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = path === item.path || (item.path !== '/' && path.startsWith(item.path))
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'fill-primary/10 stroke-primary' : 'stroke-[1.5]'} />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white ring-2 ring-white">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
