export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

// Parses a dollar string into integer cents. Returns null unless it is $0.01 to $10,000.00.
export function dollarsToCents(v) {
  const s = String(v).trim().replace(/^\$/, '')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  const cents = Math.round(parseFloat(s) * 100)
  return cents >= 1 && cents <= 1000000 ? cents : null
}
