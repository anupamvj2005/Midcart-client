import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Star, Truck, ShieldCheck, AlertCircle, FileText, CheckCircle2, Factory, PackageOpen, HeartPulse } from 'lucide-react'
import api from '../../utils/api'
import useCartStore from '../../context/cartStore'
import useAuthStore from '../../context/authStore'
import ProductCard from './ProductCard'
import SafeProductImage from './SafeProductImage'
import { productPrimaryImageUrl } from '../../utils/productImage'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, loading: cartLoading } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/ml/recommendations/${id}`).catch(() => ({ data: { recommendations: [] } })),
    ]).then(([{ data: pd }, { data: rd }]) => {
      setProduct(pd?.product || null)
      setRecommendations(rd?.recommendations || [])
    }).catch((err) => {
      console.error("Error fetching product details", err)
      setProduct(null)
      setRecommendations([])
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { navigate('/login'); return }
    await addToCart(product._id, qty)
  }

  if (loading) return (
    <div className="pt-24 min-h-screen flex justify-center py-20 bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
  if (!product) return <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-500 font-medium">Product not found</p></div>

  const discount = Math.round(((product.price.mrp - product.price.selling) / product.price.mrp) * 100)
  const isOutOfStock = product.stock?.quantity === 0
  const isLowStock = product.stock?.quantity > 0 && product.stock?.quantity <= (product.stock?.lowStockThreshold || 5)

  return (
    <div className="pt-[72px] pb-20 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category?.replace('-', ' ')}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col gap-0">
            
            {/* Minimal Head Section */}
            <div className="relative border-b border-gray-100 flex py-4 px-6 md:px-10 justify-between items-center bg-gray-50/50">
              {discount > 0 && (
                <div className="bg-danger text-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm ring-1 ring-danger/10">
                  {discount}% OFF
                </div>
              )}
              {product.requiresPrescription && (
                <div className="bg-blue-50 text-brandBlue px-3 py-1 rounded-lg font-bold text-sm border border-blue-100 flex items-center gap-1.5 ml-auto">
                  <FileText size={16} /> Rx Required
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-6 md:p-10 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-light px-2.5 py-1 rounded-full">{product.category?.replace('-', ' ')}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
              {product.brand && <p className="text-gray-600 font-medium mb-1">by <span className="text-gray-900">{product.brand}</span></p>}
              {product.genericName && <p className="text-sm text-gray-500">Generic Formula: {product.genericName}</p>}

              {product.ratings?.count > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center bg-green-50 px-2 py-0.5 rounded text-primary-dark">
                    <span className="font-bold mr-1">{product.ratings.average.toFixed(1)}</span>
                    <Star size={14} className="fill-current" />
                  </div>
                  <span className="text-sm text-gray-500">({product.ratings.count} verified ratings)</span>
                </div>
              )}

              {/* Price Box */}
              <div className="mt-8 border-t border-b border-gray-100 py-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-gray-900">₹{product.price.selling}</span>
                  {product.price.mrp > product.price.selling && (
                    <span className="text-lg text-gray-400 font-medium line-through">MRP ₹{product.price.mrp}</span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mt-6 mb-8">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-danger font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-100 w-fit">
                    <AlertCircle size={20} /> Currently Out of Stock
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-2 text-yellow-700 font-bold bg-yellow-50 px-4 py-3 rounded-xl border border-yellow-100 w-fit">
                    <AlertCircle size={20} /> Hurry! Only {product.stock.quantity} left in stock
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-primary-dark font-bold bg-primary-light px-4 py-2 rounded-xl border border-green-200 w-fit">
                    <CheckCircle2 size={18} /> In Stock & Ready to Ship
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isOutOfStock && (
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  {!product.requiresPrescription && (
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-2 w-fit h-14">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors text-xl">−</button>
                      <span className="w-12 text-center font-bold text-gray-900 text-lg">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock.quantity, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors text-xl">+</button>
                    </div>
                  )}
                  {product.requiresPrescription ? (
                    <Link to="/prescriptions/upload" className="flex-1 flex items-center justify-center gap-2 bg-brandBlue text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20">
                      <FileText size={20} /> Upload Rx to Order
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                      <ShoppingCart size={20} /> Add to Cart
                    </button>
                  )}
                </div>
              )}

              {/* Delivery Features */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-brandBlue shrink-0"><Truck size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Fast Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">Free above ₹199</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-50 p-2 rounded-lg text-primary-dark shrink-0"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Genuine Meds</p>
                    <p className="text-xs text-gray-500 mt-0.5">From verified sellers</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
            {['details', 'dosage', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`flex-1 min-w-[120px] py-4 px-6 text-center font-bold text-sm transition-colors border-b-2 outline-none ${
                  activeTab === tab 
                    ? 'border-primary text-primary bg-primary-light/30' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'details' ? 'Medicine Info' : tab === 'dosage' ? 'Dosage & Warnings' : 'User Reviews'}
              </button>
            ))}
          </div>
          
          <div className="p-6 md:p-8">
            {activeTab === 'details' && (
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 tracking-wider uppercase mb-2"><Factory size={16} /> Manufacturer</h3>
                    <p className="text-gray-900 font-medium">{product.manufacturer || 'Information not provided'}</p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 tracking-wider uppercase mb-2"><HeartPulse size={16} /> Key Composition</h3>
                    <p className="text-gray-900 font-medium">{product.composition || 'Information not provided'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 tracking-wider uppercase mb-2"><PackageOpen size={16} /> Storage Instructions</h3>
                    <p className="text-gray-900 font-medium">{product.storageInstructions || 'Store in a cool, dry place away from direct sunlight.'}</p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 tracking-wider uppercase mb-2"><AlertCircle size={16} /> Possible Side Effects</h3>
                    <p className="text-gray-900 font-medium leading-relaxed">{product.sideEffects || 'No major side effects reported. Consult a physician if you experience discomfort.'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'dosage' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden">
                <AlertCircle className="absolute -right-4 -bottom-4 text-yellow-200/50 w-32 h-32" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-lg font-bold text-yellow-900">Recommended Dosage & Safety</h3>
                  <p className="text-yellow-800 leading-relaxed font-medium">
                    {product.dosage || 'Please consult your doctor or pharmacist for proper dosage instructions tailored to your condition.'}
                  </p>
                  <div className="bg-white/60 p-4 rounded-lg mt-4 border border-yellow-200/50">
                    <p className="text-sm font-bold text-yellow-900 mb-1">Warning:</p>
                    <p className="text-xs text-yellow-800">Do not exceed the daily recommended dosage. Keep out of reach of children. If you are pregnant or nursing, consult a healthcare professional before use.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid md:grid-cols-2 gap-6">
                {product.reviews?.length === 0 ? (
                  <div className="md:col-span-2 text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <Star size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  product.reviews?.map((r, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center font-bold text-xs uppercase">
                            {(r.user?.name || 'A')[0]}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{r.user?.name || 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations?.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Bought Together</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {recommendations?.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
