import { useState } from 'react'
import { PRODUCT_IMAGE_FALLBACK } from '../../utils/productImage'

/**
 * Renders a product image with a reliable fallback if the URL breaks.
 * Supports array of sources for format fallback.
 * Avoid mix-blend-multiply — it makes many photos look faint or invisible.
 */
export default function SafeProductImage({ src, alt, className = '', loading = 'lazy' }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sources = Array.isArray(src) ? src : [src || PRODUCT_IMAGE_FALLBACK]
  const currentSrc = sources[currentIndex] || PRODUCT_IMAGE_FALLBACK

  const handleError = () => {
    if (currentIndex < sources.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // All sources failed, use fallback
      setCurrentIndex(sources.length)
    }
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Medicine'}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  )
}
