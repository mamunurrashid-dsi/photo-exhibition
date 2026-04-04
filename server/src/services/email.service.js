import transporter from '../config/mailer.js'

const FROM = process.env.EMAIL_FROM || 'PhotoExhibition <noreply@photoexhibition.com>'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

export async function sendVerificationEmail(to, token) {
  const link = `${CLIENT_URL}/verify-email/${token}`
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verify your PhotoExhibition account',
    html: `
      <h2>Welcome to PhotoExhibition!</h2>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <a href="${link}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verify Email</a>
      <p>Or copy this link: ${link}</p>
    `,
  })
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${CLIENT_URL}/reset-password/${token}`
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset your PhotoExhibition password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${link}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a>
      <p>Or copy this link: ${link}</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

export async function sendSubmissionConfirmationEmail(to, submitterName, exhibitionTitle) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your submission to "${exhibitionTitle}" has been received`,
    html: `
      <h2>Submission Received</h2>
      <p>Hi ${submitterName},</p>
      <p>Your photo submission to <strong>${exhibitionTitle}</strong> has been received and is pending review.</p>
      <p>You'll be notified once the organizer reviews your submission.</p>
    `,
  })
}

export async function sendSubmissionStatusEmail(to, submitterName, exhibitionTitle, status, reason) {
  const isApproved = status === 'approved'
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your submission to "${exhibitionTitle}" has been ${status}`,
    html: `
      <h2>Submission ${isApproved ? 'Approved! 🎉' : 'Not Selected'}</h2>
      <p>Hi ${submitterName},</p>
      ${
        isApproved
          ? `<p>Congratulations! Your submission to <strong>${exhibitionTitle}</strong> has been approved and is now visible in the gallery.</p>`
          : `<p>Thank you for submitting to <strong>${exhibitionTitle}</strong>. Unfortunately, your submission was not selected this time.</p>
             ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}`
      }
    `,
  })
}
