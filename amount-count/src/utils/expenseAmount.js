export function normalizeExpenseAmountInput(rawValue) {
  const raw = String(rawValue ?? '')
  let cleaned = raw.replace(/[^\d.]/g, '')

  if (cleaned.startsWith('.')) {
    cleaned = `0${cleaned}`
  }

  const dotIndex = cleaned.indexOf('.')
  if (dotIndex !== -1) {
    const integerPart = cleaned.slice(0, dotIndex)
    const decimalPart = cleaned
      .slice(dotIndex + 1)
      .replace(/\./g, '')
      .slice(0, 2)

    if (raw.endsWith('.') && decimalPart.length === 0) {
      return `${integerPart || '0'}.`
    }

    return decimalPart.length > 0
      ? `${integerPart || '0'}.${decimalPart}`
      : integerPart || '0'
  }

  return cleaned
}

export function calculateExpenseTotal(amounts) {
  return Math.round(
    amounts.reduce((sum, value) => {
      const parsed = Number.parseFloat(String(value ?? '').trim())
      return Number.isFinite(parsed) ? sum + parsed : sum
    }, 0) * 100,
  ) / 100
}
