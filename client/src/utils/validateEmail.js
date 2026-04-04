export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function getEmailDomain(email) {
  return email.split('@')[1] || ''
}
