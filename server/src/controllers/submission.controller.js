import Exhibition from '../models/Exhibition.js'
import Submission from '../models/Submission.js'
import Photo from '../models/Photo.js'
import { deleteImage, getThumbnailUrl } from '../services/cloudinary.service.js'
import { LIMITS } from '../config/configurations.js'
import {
  sendSubmissionConfirmationEmail,
  sendSubmissionStatusEmail,
} from '../services/email.service.js'

export async function createSubmission(req, res, next) {
  try {
    const {
      exhibitionId,
      submitterName,
      instagramHandle,
      termsAccepted,
      photoTitles,
      photoCategories,
      photoGears,
    } = req.body

    const submitterEmail = req.user.email.toLowerCase().trim()

    const exhibition = await Exhibition.findById(exhibitionId)
    if (!exhibition || exhibition.type !== 'online') {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    const now = new Date()
    if (now < new Date(exhibition.submissionStartDate) || now > new Date(exhibition.submissionEndDate)) {
      return res.status(400).json({
        success: false,
        message: 'Submissions are not currently open for this exhibition.',
      })
    }

    if (termsAccepted !== 'true' && termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions.',
      })
    }

    const isOwner = exhibition.createdBy.toString() === req.user._id.toString()

    if (!isOwner && !exhibition.allowSubmissionFromOthers) {
      return res.status(403).json({
        success: false,
        message: 'This exhibition only accepts submissions from the organizer.',
      })
    }

    // Owners can submit multiple times; other users are limited to one submission each
    if (!isOwner) {
      const existing = await Submission.findOne({ exhibition: exhibitionId, submitterEmail })
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted to this exhibition.',
        })
      }
    }

    const titles = JSON.parse(photoTitles || '[]')
    const categories = JSON.parse(photoCategories || '[]')
    const gears = JSON.parse(photoGears || '[]')
    const files = req.files || []

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one photo is required.' })
    }

    const currentPhotoCount = await Photo.countDocuments({ exhibition: exhibitionId })
    if (currentPhotoCount + files.length > LIMITS.MAX_PHOTOS_PER_EXHIBITION) {
      const remaining = LIMITS.MAX_PHOTOS_PER_EXHIBITION - currentPhotoCount
      return res.status(400).json({
        success: false,
        message:
          remaining <= 0
            ? 'This exhibition has reached its photo limit and is no longer accepting submissions.'
            : `This exhibition can only accept ${remaining} more photo(s). Please reduce your selection.`,
      })
    }

    const submission = await Submission.create({
      exhibition: exhibitionId,
      submitterName,
      submitterEmail,
      instagramHandle: instagramHandle || null,
      termsAccepted: true,
    })

    const photoPromises = files.map((file, idx) => {
      const imageUrl = file.path
      const thumbnailUrl = getThumbnailUrl(imageUrl, 400)
      return Photo.create({
        submission: submission._id,
        exhibition: exhibitionId,
        title: titles[idx] || `Photo ${idx + 1}`,
        category: (categories[idx] || exhibition.categories[0] || 'general').toLowerCase(),
        cameraGear: gears[idx] || null,
        cloudinaryPublicId: file.filename,
        imageUrl,
        thumbnailUrl,
        submitterName,
        submitterUser: req.user._id,
      })
    })

    await Promise.all(photoPromises)

    sendSubmissionConfirmationEmail(submitterEmail, submitterName, exhibition.title).catch(console.error)

    res.status(201).json({ success: true, message: 'Submission received. Thank you!' })
  } catch (err) {
    next(err)
  }
}

export async function checkDuplicateSubmission(req, res, next) {
  try {
    const { exhibitionId, email } = req.query
    if (!exhibitionId || !email) {
      return res.status(400).json({ success: false, message: 'exhibitionId and email are required' })
    }
    const existing = await Submission.findOne({
      exhibition: exhibitionId,
      submitterEmail: email.toLowerCase().trim(),
    })
    res.json({ success: true, hasSubmitted: !!existing })
  } catch (err) {
    next(err)
  }
}

export async function getSubmissions(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const exhibition = await Exhibition.findById(req.params.exhibitionId)
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const filter = { exhibition: req.params.exhibitionId }
    if (status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [submissions, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Submission.countDocuments(filter),
    ])

    const submissionIds = submissions.map((s) => s._id)
    const photos = await Photo.find({ submission: { $in: submissionIds } })

    const submissionsWithPhotos = submissions.map((sub) => ({
      ...sub.toObject(),
      photos: photos.filter((p) => p.submission.toString() === sub._id.toString()),
    }))

    res.json({
      success: true,
      submissions: submissionsWithPhotos,
      total,
      totalPages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    next(err)
  }
}

export async function getSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id).populate('exhibition')
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    const exhibition = submission.exhibition
    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const photos = await Photo.find({ submission: submission._id })
    res.json({ success: true, submission: { ...submission.toObject(), photos } })
  } catch (err) {
    next(err)
  }
}

export async function approveSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id).populate('exhibition')
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    const exhibition = submission.exhibition
    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    submission.status = 'approved'
    submission.reviewedBy = req.user._id
    submission.reviewedAt = new Date()
    await submission.save()

    await Photo.updateMany({ submission: submission._id }, { status: 'approved' })

    sendSubmissionStatusEmail(
      submission.submitterEmail,
      submission.submitterName,
      exhibition.title,
      'approved'
    ).catch(console.error)

    res.json({ success: true, message: 'Submission approved' })
  } catch (err) {
    next(err)
  }
}

export async function unapproveSubmission(req, res, next) {
  try {
    const { reason } = req.body
    const submission = await Submission.findById(req.params.id).populate('exhibition')
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    const exhibition = submission.exhibition
    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    if (submission.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved submissions can be unapproved' })
    }

    submission.status = 'pending'
    submission.reviewedBy = undefined
    submission.reviewedAt = undefined
    submission.rejectionReason = undefined
    await submission.save()

    await Photo.updateMany({ submission: submission._id }, { status: 'pending' })

    sendSubmissionStatusEmail(
      submission.submitterEmail,
      submission.submitterName,
      exhibition.title,
      'unapproved',
      reason
    ).catch(console.error)

    res.json({ success: true, message: 'Submission unapproved' })
  } catch (err) {
    next(err)
  }
}

export async function rejectSubmission(req, res, next) {
  try {
    const { reason } = req.body
    const submission = await Submission.findById(req.params.id).populate('exhibition')
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    const exhibition = submission.exhibition
    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    submission.status = 'rejected'
    submission.reviewedBy = req.user._id
    submission.reviewedAt = new Date()
    submission.rejectionReason = reason || null
    await submission.save()

    await Photo.updateMany({ submission: submission._id }, { status: 'rejected' })

    sendSubmissionStatusEmail(
      submission.submitterEmail,
      submission.submitterName,
      exhibition.title,
      'rejected',
      reason
    ).catch(console.error)

    res.json({ success: true, message: 'Submission rejected' })
  } catch (err) {
    next(err)
  }
}

export async function deleteSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id).populate('exhibition')
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    const exhibition = submission.exhibition
    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const photos = await Photo.find({ submission: submission._id })
    await Promise.all(photos.map((p) => deleteImage(p.cloudinaryPublicId)))
    await Photo.deleteMany({ submission: submission._id })
    await submission.deleteOne()

    res.json({ success: true, message: 'Submission deleted' })
  } catch (err) {
    next(err)
  }
}
