import User from '../models/User.js'
import Exhibition from '../models/Exhibition.js'
import Submission from '../models/Submission.js'
import Photo from '../models/Photo.js'
import Rating from '../models/Rating.js'
import Comment from '../models/Comment.js'
import { deleteImage } from '../services/cloudinary.service.js'

export async function getStats(_req, res, next) {
  try {
    const [users, exhibitions, submissions, photos] = await Promise.all([
      User.countDocuments(),
      Exhibition.countDocuments(),
      Submission.countDocuments(),
      Photo.countDocuments({ status: 'approved' }),
    ])
    res.json({ success: true, stats: { users, exhibitions, submissions, approvedPhotos: photos } })
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
