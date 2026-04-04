function toYMD(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(dateStr) {
  return toYMD(dateStr)
}

export function formatDateShort(dateStr) {
  return toYMD(dateStr)
}

export function isSubmissionOpen(startDate, endDate) {
  const now = new Date()
  return new Date(startDate) <= now && now <= new Date(endDate)
}
