import { v4 as uuidv4 } from 'uuid'
import Exhibition from '../models/Exhibition.js'
import Photo from '../models/Photo.js'
import Submission from '../models/Submission.js'
import Rating from '../models/Rating.js'
import Comment from '../models/Comment.js'
import User from '../models/User.js'
import { deleteImage } from '../services/cloudinary.service.js'
import { LIMITS, FEATURES } from '../config/configurations.js'
import { sendNewExhibitionAdminEmail } from '../services/email.service.js'

export async function getExhibitions(req, res, next) {
  try {
    const { type, status, search, page = 1, limit = 12 } = req.query
    const filter = { visibility: 'public' }
    if (type) filter.type = type
    if (status) filter.status = status
    if (search) filter.title = { $regex: search, $options: 'i' }

    const skip = (Number(page) - 1) * Number(limit)
    const [exhibitions, total] = await Promise.all([
      Exhibition.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name')
        .select('-privateToken -allowedEmailDomain'),
      Exhibition.countDocuments(filter),
    ])

    res.json({
      success: true,
      exhibitions,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      page: Number(page),
    })
  } catch (err) {
    next(err)
  }
}

export async function getMyExhibitions(req, res, next) {
  try {
    const exhibitions = await Exhibition.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, exhibitions })
  } catch (err) {
    next(err)
  }
}

export async function getExhibition(req, res, next) {
  try {
    const exhibition = await Exhibition.findById(req.params.id).populate('createdBy', 'name email')
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    const data = exhibition.toObject()
    if (exhibition.visibility === 'private') {
      delete data.privateToken
      delete data.allowedEmailDomain
    }

    res.json({ success: true, exhibition: data })
  } catch (err) {
    next(err)
  }
}

export async function getPrivateExhibition(req, res, next) {
  try {
    const exhibition = await Exhibition.findOne({ privateToken: req.params.token })
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    const data = exhibition.toObject()
    delete data.privateToken
    res.json({ success: true, exhibition: data })
  } catch (err) {
    next(err)
  }
}

export async function verifyPrivateAccess(req, res, next) {
  try {
    const exhibition = await Exhibition.findOne({ privateToken: req.params.token })
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    if (exhibition.allowedEmailDomain) {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' })
      }
      const domain = email.split('@')[1]?.toLowerCase()
      if (domain !== exhibition.allowedEmailDomain) {
        return res.status(403).json({
          success: false,
          message: `Access is restricted to @${exhibition.allowedEmailDomain} email addresses.`,
        })
      }
    }

    res.json({ success: true, message: 'Access granted' })
  } catch (err) {
    next(err)
  }
}

export async function getExhibitionGallery(req, res, next) {
  try {
    const { category } = req.query
    const filter = { exhibition: req.params.id, status: 'approved' }
    if (category) filter.category = category.toLowerCase()

    const photos = await Photo.find(filter).sort({ avgRating: -1, createdAt: -1 }).select('-submission')
    res.json({ success: true, photos })
  } catch (err) {
    next(err)
  }
}

export async function createExhibition(req, res, next) {
  try {
    const { type, visibility } = req.body
    const data = { ...req.body, createdBy: req.user._id }

    if (type === 'online') {
      const count = await Exhibition.countDocuments({ createdBy: req.user._id, type: 'online' })
      if (count >= LIMITS.MAX_ONLINE_EXHIBITIONS_PER_ORGANIZER) {
        return res.status(400).json({
          success: false,
          message: `You can create at most ${LIMITS.MAX_ONLINE_EXHIBITIONS_PER_ORGANIZER} online exhibitions.`,
        })
      }
    }

    if (req.file) {
      data.coverImageUrl = req.file.path
      data.coverImagePublicId = req.file.filename
    }

    if (type === 'online' && visibility === 'private') {
      data.privateToken = uuidv4()
    }

    if (typeof data.categories === 'string') {
      try {
        data.categories = JSON.parse(data.categories)
      } catch {
        data.categories = data.categories.split(',').map((c) => c.trim().toLowerCase())
      }
    }

    // Apply approval flow if feature is enabled
    if (FEATURES.REQUIRE_EXHIBITION_APPROVAL) {
      data.status = 'pending_approval'
    }

    const exhibition = await Exhibition.create(data)

    // Notify all admins by email (fire-and-forget — don't fail the request if email fails)
    if (FEATURES.REQUIRE_EXHIBITION_APPROVAL) {
      try {
        const admins = await User.find({ role: 'admin' }).select('email').lean()
        if (admins.length > 0) {
          const adminEmails = admins.map((a) => a.email)
          await sendNewExhibitionAdminEmail(
            adminEmails,
            exhibition,
            req.user.name,
            req.user.email
          )
        }
      } catch (emailErr) {
        console.error('Failed to send admin notification email:', emailErr.message)
      }
    }

    res.status(201).json({
      success: true,
      exhibition: exhibition.toObject(),
      pendingApproval: FEATURES.REQUIRE_EXHIBITION_APPROVAL,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateExhibition(req, res, next) {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const updates = { ...req.body }

    if (req.file) {
      if (exhibition.coverImagePublicId) await deleteImage(exhibition.coverImagePublicId)
      updates.coverImageUrl = req.file.path
      updates.coverImagePublicId = req.file.filename
    }

    if (typeof updates.categories === 'string') {
      try {
        updates.categories = JSON.parse(updates.categories)
      } catch {
        updates.categories = updates.categories.split(',').map((c) => c.trim().toLowerCase())
      }
    }

    const updated = await Exhibition.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json({ success: true, exhibition: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteExhibition(req, res, next) {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
    if (!exhibition) {
      return res.status(404).json({ success: false, message: 'Exhibition not found' })
    }

    if (
      exhibition.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    if (exhibition.coverImagePublicId) await deleteImage(exhibition.coverImagePublicId)

    const photos = await Photo.find({ exhibition: exhibition._id }).select('_id cloudinaryPublicId')
    const photoIds = photos.map((p) => p._id)

    await Promise.all(photos.map((p) => deleteImage(p.cloudinaryPublicId)))
    await Rating.deleteMany({ photo: { $in: photoIds } })
    await Comment.deleteMany({ photo: { $in: photoIds } })
    await Photo.deleteMany({ exhibition: exhibition._id })
    await Submission.deleteMany({ exhibition: exhibition._id })
    await exhibition.deleteOne()

    res.json({ success: true, message: 'Exhibition deleted' })
  } catch (err) {
    next(err)
  }
}
