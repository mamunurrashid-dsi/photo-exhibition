import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export function generateJWT(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex')
}
