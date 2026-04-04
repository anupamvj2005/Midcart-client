/** Fallback when URL is missing or fails to load (static placeholder). */
export const PRODUCT_IMAGE_FALLBACK = '/images/no-image.svg';

const MEDICINE_ID_MAP = {
  paracetamol: 1,
  metformin: 2,
  'vitamin c': 3,
  atorvastatin: 4,
  cetirizine: 5,
  omeprazole: 6,
  azithromycin: 7,
  ibuprofen: 8,
  clotrimazole: 9,
  ciprofloxacin: 10,
};

export function getMedicineImageUrls(source) {
  if (!source) return null;

  let name = '';
  if (typeof source === 'string') {
    name = source.trim().toLowerCase();
  } else if (typeof source === 'object') {
    // prefer main label, then generic string fields
    name = (source.name || source.genericName || source.salt || source.composition || '').toString().trim().toLowerCase();
  }

  if (!name) return null;

  // partial token matching (e.g., Paracetamol 500mg -> paracetamol)
  const tokens = name.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (MEDICINE_ID_MAP[token]) {
      const id = MEDICINE_ID_MAP[token];
      return [`/medicine-images/${id}.jpg`, `/medicine-images/${id}.jpeg`, `/medicine-images/${id}.webp`];
    }
  }

  // fallback name-based search in keys
  for (const key of Object.keys(MEDICINE_ID_MAP)) {
    if (name.includes(key)) {
      const id = MEDICINE_ID_MAP[key];
      return [`/medicine-images/${id}.jpg`, `/medicine-images/${id}.jpeg`, `/medicine-images/${id}.webp`];
    }
  }

  return null;
}

export function productPrimaryImageUrl(product) {
  const urls = getMedicineImageUrls(product);
  if (urls) return urls;
  const url = product?.images?.[0]?.url;
  if (typeof url === 'string' && url.trim()) return [url.trim()];
  return [PRODUCT_IMAGE_FALLBACK];
}
