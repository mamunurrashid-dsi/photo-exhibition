import User from '../models/User.js'
import Exhibition from '../models/Exhibition.js'
import Submission from '../models/Submission.js'
import Photo from '../models/Photo.js'
import Rating from '../models/Rating.js'
import Comment from '../models/Comment.js'
import { deleteImage } from '../services/cloudinary.service.js'
import {
  sendExhibitionApprovedEmail,
  sendExhibitionRejectedEmail,
  sendStalePendingPhotoDeletedEmail,
} from '../services/email.service.js'

export async function getStats(_req, res, next) {
  try {
    const [users, exhibitions, submissions, photos] = await Promise.all([
      User.countDocuments(),
      Exhibition.countDocuments(),
      Submission.countDocuments(),
      Photo.countDocuments({ status: 'pending' }),
    ])
    res.json({ success: true, stats: { users, exhibitions, submissions, pendingPhotos: photos } })
  } catch (err) {
    next(err)
  }
}

export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query
    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ])
    res.json({ success: true, users, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    next(err)
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req, res, next) {
  try {
    const { role } = req.body
    const allowed = {}
    if (role) allowed.role = role

    const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    next(err)
  }
}

export async function getExhibitions(req, res, next) {
  try {
    const { page = 1, limit = 20, search, type, status } = req.query
    const filter = {}
    if (search) filter.title = { $regex: search, $options: 'i' }
    if (type) filter.type = type
    if (status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [exhibitions, total] = await Promise.all([
      Exhibition.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Exhibition.countDocuments(filter),
    ])
    res.json({ success: true, exhibitions, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    next(err)
  }
}

export async function deleteExhibition(req, res, next) {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
    if (!exhibition) return res.status(404).json({ success: false, message: 'Exhibition not found' })

    if (exhibition.coverImagePublicId) await deleteImage(exhibition.coverImagePublicId)

    const photos = await Photo.find({ exhibition: exhibition._id }).select('_id cloudinaryPublicId')
    const photoIds = photos.map((p) => p._id)

    await Promise.all(photos.map((p) => deleteImage(p.cloudinaryPublicId)))
    await Rating.deleteMany({ photo: { $in: photoIds } })
    await Comment.deleteMany({ photo: { $in: photoIds } })
    await Photo.deleteMany({ exhibition: exhibition._id })
    await Submission.deleteMany({ exhibition: exhibition._id })
    await exhibition.deleteOne()

    res.json({ success: true, message: 'Exhibition and all its data deleted' })
  } catch (err) {
    next(err)
  }
}

export async function getSubmissions(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filter = {}
    if (status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate('exhibition', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(filter),
    ])
    res.json({ success: true, submissions, total, totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    next(err)
  }
}

export async function deleteSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id)
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' })

    const photos = await Photo.find({ submission: submission._id }).select('_id cloudinaryPublicId')
    const photoIds = photos.map((p) => p._id)

    await Promise.all(photos.map((p) => deleteImage(p.cloudinaryPublicId)))
    await Rating.deleteMany({ photo: { $in: photoIds } })
    await Comment.deleteMany({ photo: { $in: photoIds } })
    await Photo.deleteMany({ submission: submission._id })
    await submission.deleteOne()

    res.json({ success: true, message: 'Submission deleted' })
  } catch (err) {
    next(err)
  }
}

export async function moderateExhibition(req, res, next) {
  try {
    const { action, reason } = req.body
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use approve or reject.' })
    }

    const exhibition = await Exhibition.findById(req.params.id).populate('createdBy', 'name email')
    if (!exhibition) return res.status(404).json({ success: false, message: 'Exhibition not found' })

    exhibition.status = action === 'approve' ? 'active' : 'rejected'
    await exhibition.save()

    // Notify organizer by email (fire-and-forget)
    try {
      if (action === 'approve') {
        await sendExhibitionApprovedEmail(
          exhibition.createdBy.email,
          exhibition.createdBy.name,
          exhibition.title,
          exhibition._id
        )
      } else {
        await sendExhibitionRejectedEmail(
          exhibition.createdBy.email,
          exhibition.createdBy.name,
          exhibition.title,
          reason
        )
      }
    } catch (emailErr) {
      console.error('Failed to send exhibition status email:', emailErr.message)
    }

    res.json({ success: true, exhibition })
  } catch (err) {
    next(err)
  }
}

export async function moderatePhoto(req, res, next) {
  try {
    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const photo = await Photo.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' })

    res.json({ success: true, photo })
  } catch (err) {
    next(err)
  }
}

export async function getGroupedSubmissions(_req, res, next) {
  try {
    // Aggregate submission counts grouped by exhibition
    const groups = await Submission.aggregate([
      {
        $group: {
          _id: '$exhibition',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          latestSubmittedAt: { $max: '$createdAt' },
        },
      },
      { $sort: { latestSubmittedAt: -1 } },
    ])

    const exhibitionIds = groups.map((g) => g._id)
    const exhibitions = await Exhibition.find({ _id: { $in: exhibitionIds } })
      .select('title type status')
      .lean()

    const exhibitionMap = Object.fromEntries(exhibitions.map((e) => [e._id.toString(), e]))

    const result = groups
      .filter((g) => exhibitionMap[g._id?.toString()])
      .map((g) => ({
        exhibition: exhibitionMap[g._id.toString()],
        total: g.total,
        pending: g.pending,
        approved: g.approved,
        rejected: g.rejected,
        latestSubmittedAt: g.latestSubmittedAt,
      }))

    res.json({ success: true, groups: result })
  } catch (err) {
    next(err)
  }
}

export async function getStalePhotos(_req, res, next) {
  try {
    const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    const photos = await Photo.find({ status: 'pending', createdAt: { $lte: cutoff } })
      .populate('exhibition', 'title')
      .populate('submission', 'submitterName submitterEmail')
      .sort({ createdAt: 1 })
      .lean()
    res.json({ success: true, photos })
  } catch (err) {
    next(err)
  }
}

export async function deleteStalePhoto(req, res, next) {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('exhibition', 'title')
      .populate('submission', 'submitterName submitterEmail')

    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' })
    if (photo.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending photos can be deleted via moderation' })
    }

    const submitterEmail = photo.submission?.submitterEmail
    const submitterName = photo.submission?.submitterName
    const exhibitionTitle = photo.exhibition?.title

    await deleteImage(photo.cloudinaryPublicId)
    await Rating.deleteMany({ photo: photo._id })
    await Comment.deleteMany({ photo: photo._id })
    await photo.deleteOne()

    if (submitterEmail) {
      sendStalePendingPhotoDeletedEmail(submitterEmail, submitterName, exhibitionTitle, photo.title).catch(console.error)
    }

    res.json({ success: true, message: 'Photo deleted and submitter notified' })
  } catch (err) {
    next(err)
  }
}
