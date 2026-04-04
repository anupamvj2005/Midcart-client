/**
 * @param {number} subtotal
 * @param {{ discount?: number, type?: 'percent'|'flat', maxDiscount?: number } | null | undefined} coupon
 * @returns {number} rupee amount discounted (never exceeds subtotal)
 */
function computeCouponDiscount(subtotal, coupon) {
  if (!coupon || coupon.discount == null) return 0;
  const base = Math.max(0, Number(subtotal) || 0);
  const d = Number(coupon.discount);
  if (!Number.isFinite(d) || d <= 0) return 0;

  if (coupon.type === 'percent') {
    const raw = (base * d) / 100;
    const cap =
      coupon.maxDiscount != null && Number.isFinite(Number(coupon.maxDiscount))
        ? Number(coupon.maxDiscount)
        : Infinity;
    return Math.min(Math.round(raw * 100) / 100, cap, base);
  }

  return Math.min(d, base);
}

module.exports = { computeCouponDiscount };
