import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { 
  ShieldCheck, Award, UserCheck, Clock, CheckCircle2,
  Thermometer, Activity, HeartPulse, Pill, Zap, Stethoscope, Sparkles, Syringe,
  ChevronRight, UploadCloud, Truck, Percent, Star, FileText, Lock
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import api from '../../utils/api'
import ProductCard from '../Products/ProductCard'

const CATEGORIES = [
  { slug: 'Fever & Cold', label: 'Fever & Cold', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
  { slug: 'Diabetes', label: 'Diabetes Care', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
  { slug: 'Heart Care', label: 'Heart Care', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
  { slug: 'Vitamins', label: 'Vitamins', icon: Pill, color: 'text-green-500', bg: 'bg-green-50' },
  { slug: 'Pain Relief', label: 'Pain Relief', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { slug: 'Digestive', label: 'Digestive', icon: Stethoscope, color: 'text-teal-500', bg: 'bg-teal-50' },
  { slug: 'Skin Care', label: 'Skin Care', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-50' },
  { slug: 'Antibiotics', label: 'Antibiotics', icon: Syringe, color: 'text-purple-500', bg: 'bg-purple-50' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const suggestionList = ['Paracetamol', 'Crocin', 'Dolo 650', 'Ibuprofen', 'Vitamin C', 'Azithromycin']

  useEffect(() => {
    const query = searchText.trim().toLowerCase()
    if (!query) return setFilteredSuggestions([])
    setFilteredSuggestions(suggestionList.filter(item => item.toLowerCase().includes(query)).slice(0, 4))
  }, [searchText])

  useEffect(() => {
    console.log("Home Component Loaded");
    api.get('/medicines/best')
      .then(({ data }) => setFeatured(data?.products || []))
      .catch((err) => {
        console.error("Error fetching featured products", err);
        setFeatured([]);
      })
      .finally(() => setLoading(false));
  }, [])

  return (
    <div className="pt-[72px] pb-16 min-h-screen bg-gray-50 font-sans">
      
      {/* ─── Hero Section ─── */}
      <section className="bg-white border-b border-gray-200 lg:py-16 py-10">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-primary-dark text-xs font-bold tracking-wide uppercase">
              <ShieldCheck size={14} /> 100% Secure & Trusted
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Your Health, <br/> Delivered in <span className="text-primary">Minutes.</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Order genuine medicines online from certified pharmacies. Save up to 60% on your monthly healthcare expenses.
            </p>
            
            <div className="relative">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search medicines, brands, symptoms..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => window.location.assign(`/products?search=${encodeURIComponent(searchText.trim())}`)}
                className="absolute right-1.5 top-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
              >Search</button>
              {filteredSuggestions.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-sm max-h-48 overflow-auto">
                  {filteredSuggestions?.map(item => (
                    <button
                      key={item}
                      onClick={() => { setSearchText(item); setFilteredSuggestions([]); window.location.assign(`/products?search=${encodeURIComponent(item)}`)}}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >{item}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/products" className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                Order Medicines <ChevronRight size={18} />
              </Link>
              <Link to="/prescriptions/upload" className="flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-light transition-colors">
                <UploadCloud size={18} className="text-primary" /> Upload Prescription
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <CheckCircle2 size={24} className="text-primary" />
                <span className="text-xs font-semibold text-gray-700">Genuine Meds</span>
              </div>
              <div className="flex flex-col gap-1">
                <Award size={24} className="text-primary" />
                <span className="text-xs font-semibold text-gray-700">Certified Rx</span>
              </div>
              <div className="flex flex-col gap-1">
                <UserCheck size={24} className="text-primary" />
                <span className="text-xs font-semibold text-gray-700">Expert Staff</span>
              </div>
              <div className="flex flex-col gap-1">
                <Clock size={24} className="text-primary" />
                <span className="text-xs font-semibold text-gray-700">Delivery 2-6 hrs</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-light to-transparent rounded-full blur-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=800" 
              alt="Pharmacy Delivery" 
              className="relative z-10 w-full rounded-2xl shadow-2xl border-4 border-white object-cover aspect-[4/3]"
            />
            {/* Floating review card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-4">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">4.9/5 Rating</p>
                <p className="text-xs text-gray-500">From 10,000+ users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Offers Carousel ─── */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-30">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ 768: { slidesPerView: 2 } }}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          className="pb-10 drop-shadow-sm"
        >
          <SwiperSlide>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 h-40 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-xs font-bold tracking-wider mb-2 bg-white/20 inline-block px-2 py-1 rounded">NEW USERS</div>
                <h3 className="text-xl font-bold mb-1">Flat 20% OFF</h3>
                <p className="text-sm text-blue-50">Use code <span className="font-bold border border-white/40 px-1 py-0.5 rounded">FIRST20</span></p>
              </div>
              <Percent className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="bg-gradient-to-r from-green-600 to-primary rounded-xl p-6 h-40 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-xs font-bold tracking-wider mb-2 bg-white/20 inline-block px-2 py-1 rounded">SUBSCRIPTION</div>
                <h3 className="text-xl font-bold mb-1">Extra 10% Savings</h3>
                <p className="text-sm text-green-50">On your monthly medicine refills</p>
              </div>
              <Truck className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl p-6 h-40 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-xs font-bold tracking-wider mb-2 bg-white/20 inline-block px-2 py-1 rounded">HEALTHCARE</div>
                <h3 className="text-xl font-bold mb-1">Free Doctor Consult</h3>
                <p className="text-sm text-purple-50">On all orders above ₹1000</p>
              </div>
              <Stethoscope className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ─── Shop by Category ─── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <Link to={`/products?category=${cat.slug}`} key={cat.slug} className="bg-white group rounded-xl p-4 border border-gray-100 hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Trust Section ─── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Certified Pharmacy', icon: ShieldCheck, desc: 'Licensed pharmacists and verified operations.' },
            { title: 'Genuine Medicines Guarantee', icon: CheckCircle2, desc: '100% authentic brands and batch tested.' },
            { title: 'Secure Payments', icon: Lock, desc: 'Encrypted checkout with PCI compliance.' },
            { title: '10,000+ Happy Customers', icon: UserCheck, desc: 'Trusted by healthcare shoppers nationwide.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-all">
              <item.icon size={20} className="text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Prescription CTA Banner ─── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-brandBlue rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute opacity-10 -right-10 -top-10 w-64 h-64 bg-white rounded-full"></div>
          
          <div className="relative z-10 text-white md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FileText size={32} /> Have a Prescription?
            </h2>
            <p className="text-blue-100 text-lg">
              Upload your prescription and let our licensed pharmacists arrange everything. Safe, fast, and simple.
            </p>
            <Link to="/prescriptions/upload" className="inline-block bg-white text-brandBlue px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg mt-2">
              Order via Prescription
            </Link>
          </div>
          
          <div className="relative z-10 md:w-1/2 w-full grid grid-cols-2 gap-4">
            {['1. Upload Rx', '2. Pharmacist Review', '3. Medicines Added', '4. Doordash Delivery'].map((step) => (
              <div key={step} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white font-medium flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-300 flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bestselling Medicines ─── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bestselling Medicines</h2>
            <p className="text-gray-500 text-sm mt-1">Top rated healthcare products</p>
          </div>
          <Link to="/products" className="text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featured?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
