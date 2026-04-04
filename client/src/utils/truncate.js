export function truncate(str, maxLength = 100) {
  if (!str) return ''
  return str.length <= maxLength ? str : str.slice(0, maxLength).trimEnd() + '…'
}
