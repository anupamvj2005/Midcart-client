import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, FileText } from 'lucide-react'
import useCartStore from '../../context/cartStore'
import useAuthStore from '../../context/authStore'
import SafeProductImage from './SafeProductImage'
import { productPrimaryImageUrl, getMedicineImageUrls } from '../../utils/productImage'

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  const discount = Math.round(((product.price.mrp - product.price.selling) / product.price.mrp) * 100)
  const isLowStock = product.stock?.quantity <= (product.stock?.lowStockThreshold || 5)
  const isOutOfStock = product.stock?.quantity === 0
  const mappedImages = getMedicineImageUrls(product)
  const cardImage = mappedImages || productPrimaryImageUrl(product)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn()) { navigate('/login'); return }
    if (product.requiresPrescription) { navigate(`/products/${product._id}`); return }
    await addToCart(product._id, 1)
  }

  return (
    <Link to={`/products/${product._id}`} className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      {/* Badges Container */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end pointer-events-none">
        {discount > 0 && (
          <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center shadow-sm">
            {discount}% OFF
          </span>
        )}
        {product.requiresPrescription && (
          <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <FileText size={10} /> Rx
          </span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="bg-yellow-50 text-yellow-600 border border-yellow-100 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Low Stock
          </span>
        )}
      </div>

      {isOutOfStock && (
        <div className="absolute inset-x-0 top-0 bg-red-50 py-1.5 flex items-center justify-center border-b border-red-100 z-10">
          <span className="text-danger text-[10px] font-bold uppercase tracking-wider">
            Out of stock
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col flex-grow p-5 gap-2 ${isOutOfStock ? 'pt-8' : ''}`}>
        <div>
          <span className="text-[10px] tracking-wider text-gray-400 capitalize font-medium">{product.category?.replace('-', ' ')}</span>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {(product.salt || product.ingredients || product.brand) && (
            <p className="text-xs text-gray-500 mt-1 truncate">{product.salt || product.ingredients || product.brand}</p>
          )}
        </div>

        {/* Rating & Stock Info */}
        <div className="flex justify-between items-center mt-2">
          {product.ratings?.count > 0 ? (
            <div className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 bg-green-50 text-primary-dark w-fit rounded-md">
              <span className="pt-0.5">{product.ratings.average.toFixed(1)}</span>
              <Star size={12} className="fill-current text-primary" />
              <span className="text-gray-400 text-[10px] border-l border-green-200 pl-1 ml-0.5">({product.ratings.count})</span>
            </div>
          ) : <div className="h-5"></div>}
          
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            {product.dosage || (product.stock?.unit ? `Per ${product.stock.unit}` : 'Standard Dosage')}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-2 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">MRP <span className="line-through">₹{product.price.mrp}</span></div>
            <div className="text-lg font-bold text-gray-900 leading-none mt-0.5">₹{product.price.selling}</div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-light text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95'
            }`}
            title={product.requiresPrescription ? 'View Details' : 'Add to Cart'}
          >
            {product.requiresPrescription ? (
              <FileText size={18} />
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
