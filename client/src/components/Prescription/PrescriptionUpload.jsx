import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, FileText, CheckCircle2, PackageCheck, AlertTriangle, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useCartStore from '../../context/cartStore'
import useAuthStore from '../../context/authStore'

export default function PrescriptionUpload() {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({ doctorName: '', patientName: '', notes: '' })
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [meds, setMeds] = useState([])
  const [uploadStep, setUploadStep] = useState('upload') // upload|review|delivered

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted].slice(0, 5))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
  })

  const removeFile = (idx) => setFiles(f => f.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0 && !form.doctorName && !form.patientName && !form.notes) {
      toast.error('Please upload an image or fill details'); 
      return 
    }

    setUploading(true)
    try {
      setUploadStep('review')
      const fd = new FormData()
      if (files.length > 0) files.forEach(f => fd.append('images', f))
      fd.append('doctorName', form.doctorName)
      fd.append('patientName', form.patientName)
      fd.append('notes', form.notes)

      const { data } = await api.post('/prescriptions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data?.prescription)
      setMeds((data?.prescription?.extractedMedicines || [])?.map(m => ({
        ...m,
        editableQuantity: m.quantity || '1',
      })))
      setUploadStep('delivered')
      toast.success('Prescription analyzed automatically!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleMedsChange = (index, field, value) => {
    const updated = [...meds]
    updated[index][field] = value
    setMeds(updated)
  }

  const handleAddAllToCart = () => {
    if (!isLoggedIn()) {
      toast.error('Please login to add to cart')
      navigate('/login')
      return
    }
    
    let added = 0
    meds.forEach(m => {
      const p = m.matchedProduct
      const canAdd = p && !p.requiresPrescription && (p.stock?.quantity ?? 0) > 0
      if (canAdd) {
        const q = Math.max(1, parseInt(m.editableQuantity, 10) || 1)
        addToCart(p._id, Math.min(q, p.stock?.quantity || q))
        added++
      }
    })
    
    if (added > 0) {
      toast.success(`Successfully added ${added} items to cart!`)
      navigate('/cart')
    } else {
      toast.error('No items were eligible to auto-add.')
    }
  }

  // --- Success Render (Confirmation Step) ---
  if (result) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 pb-20">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-4xl w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <div className="mb-4 flex items-center justify-center gap-3 text-xs font-semibold">
              <span className="px-2 py-1 rounded-full bg-green-500 text-white">Delivered</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Review default</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Review Detected Items</h2>
            <p className="text-gray-500 text-sm">Please verify quantities and availability before adding to your cart.</p>
          </div>

          {result.rawOCRText && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Raw Extracted Text</p>
              <p className="font-mono text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto bg-white p-3 rounded border border-gray-100 shadow-inner">
                {result.rawOCRText}
              </p>
            </div>
          )}

          <div className="mb-8 text-left">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PackageCheck size={18} className="text-primary" /> Confirm Medicines
            </h4>
            
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-600">
                      <th className="px-4 py-3 font-semibold pb-3">Medicine Info</th>
                      <th className="px-4 py-3 font-semibold text-center pb-3">Quantity</th>
                      <th className="px-4 py-3 font-semibold pb-3">Status</th>
                      <th className="px-4 py-3 font-semibold pb-3">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {meds?.map((m, i) => {
                      const p = m.matchedProduct
                      const isAvail = p && (p.stock?.quantity ?? 0) > 0

                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 min-w-[200px]">
                            <input 
                              type="text" 
                              value={m.name} 
                              onChange={(e) => handleMedsChange(i, 'name', e.target.value)}
                              className="w-full font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-primary outline-none py-1"
                            />
                            {m.dosage && <div className="text-xs text-gray-500 mt-1">{m.dosage}</div>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="number" 
                              min="1"
                              value={m.editableQuantity}
                              onChange={(e) => handleMedsChange(i, 'editableQuantity', e.target.value)}
                              disabled={!isAvail}
                              className="w-16 text-center border border-gray-200 rounded-lg p-1.5 focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {isAvail ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Not Available
                              </span>
                            )}
                            {p?.requiresPrescription && (
                              <div className="text-[10px] text-brandBlue font-semibold mt-1">Rx Required</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs w-[250px]">
                            {p ? (
                              <div>
                                <Link to={`/products/${p._id}`} className="font-bold text-primary hover:underline break-words">
                                  {p.name}
                                </Link>
                                <div className="text-gray-500 mt-0.5">₹{p.price?.selling}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 oblique">Medicine not available</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-gray-100 pt-6">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2"
              onClick={() => { setResult(null); setFiles([]) }}
            >
              Upload Another
            </button>
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary-dark px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Confirm & Add All to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Upload Form Render ---
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-xl mx-auto px-4 grid gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Upload Prescription</h1>
            <p className="text-gray-500 text-sm">Upload image, or skip image to directly add details.</p>
          </div>

          <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold">
            {['upload', 'review', 'delivered'].map((stage, index) => {
              const active = uploadStep === stage
              const completed = uploadStep !== 'upload' && stage !== 'upload' && (uploadStep !== 'review' || stage === 'review' || stage === 'delivered')
              return (
                <div key={stage} className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition ${active ? 'bg-primary text-white' : completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <span className={`${active || completed ? 'text-gray-900' : 'text-gray-400'}`}>{stage === 'upload' ? 'Upload' : stage === 'review' ? 'Review' : 'Delivered'}</span>
                  {index < 2 && <span className="w-8 h-px bg-gray-300"></span>}
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-primary bg-primary-light/30' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud size={28} className="text-brandBlue mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-900">Drag & Drop prescription here</h3>
              <p className="text-xs text-gray-400 mt-1">Images are optional. Up to 5 files allowed.</p>
            </div>

            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                      {f.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(f)} alt={f.name} className="w-14 h-14 object-cover rounded-lg" />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-500">PDF</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-danger"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input 
                  type="text" placeholder="Doctor's Name" value={form.doctorName} 
                  onChange={e => setForm({ ...form, doctorName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <input 
                  type="text" placeholder="Patient Name" value={form.patientName} 
                  onChange={e => setForm({ ...form, patientName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <textarea 
                rows={2} placeholder="Notes..." value={form.notes} 
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition shadow-lg shadow-primary/20"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                 <>Scan & Process</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
