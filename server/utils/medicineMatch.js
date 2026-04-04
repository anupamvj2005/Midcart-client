const stringSimilarity = require('string-similarity');

const normalizeMed = (s) => {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[._']/g, ' ')
    .replace(/\b(tab|tabs|tablet|tablets|cap|caps|capsule|capsules|strip|strips|syrup|syp|inj|injection|mg|ml|mcg|gm|g)\b/gi, ' ')
    .replace(/\d+\s*(mg|ml|mcg|g)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Score how well extracted OCR text matches a product (name, generic, brand, tags).
 */
function scoreProductAgainstName(medName, product) {
  const n = normalizeMed(medName);
  if (!n) return { product, matchScore: 0 };

  const fields = [
    product.name,
    product.genericName,
    product.brand,
    ...(Array.isArray(product.tags) ? product.tags : []),
  ].filter(Boolean)
   .map(f => normalizeMed(f))
   .filter(f => f.length > 0);

  if (fields.length === 0) return { product, matchScore: 0 };

  const match = stringSimilarity.findBestMatch(n, fields);
  
  // Custom boost: if exact substring match without dosage, rate higher
  let best = match.bestMatch.rating;
  const bestTarget = match.bestMatch.target;
  
  if (n.includes(bestTarget) || bestTarget.includes(n)) {
    best = Math.max(best, 0.75);
  }
  
  if (n === bestTarget) {
    best = 1;
  }

  return { product, matchScore: Math.round(best * 1000) / 1000 };
}

/**
 * Best matching active product for an OCR medicine line.
 */
async function findBestProductMatch(medicineName, Product, productsCache = null) {
  const products =
    productsCache ||
    (await Product.find({ isActive: true }).select('name genericName brand tags').lean());

  // Fast path matching across the whole catalogue using pure names mapping
  const n = normalizeMed(medicineName);
  if (!n) return { product: null, matchScore: 0 };

  let best = null;
  let bestScore = 0;

  for (const p of products) {
    const { matchScore } = scoreProductAgainstName(medicineName, p);
    if (matchScore > bestScore) {
      bestScore = matchScore;
      best = p;
    }
  }

  // Adjusted threshold for robust matching
  const threshold = 0.45;
  if (!best || bestScore < threshold) {
    return { product: null, matchScore: bestScore || 0 };
  }
  return { product: best, matchScore: bestScore };
}

module.exports = { findBestProductMatch, normalizeMed, scoreProductAgainstName };
