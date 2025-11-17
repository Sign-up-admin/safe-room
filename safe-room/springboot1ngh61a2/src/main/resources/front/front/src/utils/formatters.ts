export function formatDate(value?: string | number | Date, fallback = '--'): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }
  return date.toISOString().split('T')[0]
}

export function formatDateTime(value?: string | number | Date, fallback = '--'): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }
  const iso = date.toISOString()
  const [datePart, timePart] = iso.split('T')
  return `${datePart} ${timePart.slice(0, 8)}`
}

export function formatCurrency(value?: number | string, currency = '¥'): string {
  const num = Number(value)
  if (Number.isNaN(num)) {
    return `${currency}0.00`
  }
  return `${currency}${num.toFixed(2)}`
}

export function stripHtml(value?: string): string {
  if (!value) {
    return ''
  }
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}



