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

export async function sendNewExhibitionAdminEmail(adminEmails, exhibition, organizerName, organizerEmail) {
  await transporter.sendMail({
    from: FROM,
    to: adminEmails.join(', '),
    subject: `New exhibition pending approval: "${exhibition.title}"`,
    html: `
      <h2>New Exhibition Pending Approval</h2>
      <p>A new exhibition has been submitted and requires your review before it goes live.</p>
      <table style="border-collapse:collapse;width:100%;max-width:500px;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">Title</td><td style="padding:8px;border:1px solid #e5e7eb;">${exhibition.title}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">Type</td><td style="padding:8px;border:1px solid #e5e7eb;text-transform:capitalize;">${exhibition.type}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">Organizer</td><td style="padding:8px;border:1px solid #e5e7eb;">${organizerName} (${organizerEmail})</td></tr>
        ${exhibition.description ? `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">Description</td><td style="padding:8px;border:1px solid #e5e7eb;">${exhibition.description}</td></tr>` : ''}
      </table>
      <a href="${CLIENT_URL}/admin/exhibitions" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Review in Admin Panel</a>
    `,
  })
}

export async function sendExhibitionApprovedEmail(to, organizerName, exhibitionTitle, exhibitionId) {
  const link = `${CLIENT_URL}/exhibitions/${exhibitionId}`
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your exhibition "${exhibitionTitle}" has been approved!`,
    html: `
      <h2>Exhibition Approved 🎉</h2>
      <p>Hi ${organizerName},</p>
      <p>Your exhibition <strong>${exhibitionTitle}</strong> has been reviewed and approved. It is now live and visible to the public.</p>
      <a href="${link}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Exhibition</a>
    `,
  })
}

export async function sendExhibitionRejectedEmail(to, organizerName, exhibitionTitle, reason) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your exhibition "${exhibitionTitle}" was not approved`,
    html: `
      <h2>Exhibition Not Approved</h2>
      <p>Hi ${organizerName},</p>
      <p>Your exhibition <strong>${exhibitionTitle}</strong> has been reviewed and was not approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this is a mistake, please contact the platform administrators.</p>
    `,
  })
}

export async function sendSubmissionStatusEmail(to, submitterName, exhibitionTitle, status, reason) {
  const isApproved = status === 'approved'
  const isUnapproved = status === 'unapproved'
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your submission to "${exhibitionTitle}" has been ${isUnapproved ? 'moved back to pending review' : status}`,
    html: `
      <h2>Submission ${isApproved ? 'Approved! 🎉' : isUnapproved ? 'Moved Back to Pending' : 'Not Selected'}</h2>
      <p>Hi ${submitterName},</p>
      ${
        isApproved
          ? `<p>Congratulations! Your submission to <strong>${exhibitionTitle}</strong> has been approved and is now visible in the gallery.</p>`
          : isUnapproved
          ? `<p>Your previously approved submission to <strong>${exhibitionTitle}</strong> has been moved back to pending review by the organizer.</p>
             ${reason ? `<p><strong>Organizer note:</strong> ${reason}</p>` : ''}
             <p>You will be notified once it has been reviewed again.</p>`
          : `<p>Thank you for submitting to <strong>${exhibitionTitle}</strong>. Unfortunately, your submission was not selected this time.</p>
             ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}`
      }
    `,
  })
}
