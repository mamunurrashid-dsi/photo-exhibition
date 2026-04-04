import User from '../models/User.js'
import { generateJWT, generateRandomToken } from '../utils/generateToken.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js'

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const verificationToken = generateRandomToken()
    await User.create({
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error('Email send error:', err.message)
    )

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in.',
        needsVerification: true,
      })
    }

    const token = generateJWT(user._id)
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res) {
  res.json({ success: true, user: req.user })
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired.',
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Email verified successfully.' })
  } catch (err) {
    next(err)
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user || user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'If that email is registered and unverified, a new link has been sent.',
      })
    }

    const token = generateRandomToken()
    user.emailVerificationToken = token
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    sendVerificationEmail(email, token).catch(console.error)

    res.json({
      success: true,
      message: 'If that email is registered and unverified, a new link has been sent.',
    })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (user && user.provider === 'local') {
      const token = generateRandomToken()
      user.passwordResetToken = token
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()
      sendPasswordResetEmail(email, token).catch(console.error)
    }

    res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      })
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successfully.' })
  } catch (err) {
    next(err)
  }
}
