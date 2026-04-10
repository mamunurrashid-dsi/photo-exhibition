function toDMY(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

export function formatDate(dateStr) {
  return toDMY(dateStr)
}

export function formatDateShort(dateStr) {
  return toDMY(dateStr)
}

export function isSubmissionOpen(startDate, endDate) {
  const now = new Date()
  return new Date(startDate) <= now && now <= new Date(endDate)
}
