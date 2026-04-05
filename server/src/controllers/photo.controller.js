import Photo from '../models/Photo.js'
import Rating from '../models/Rating.js'
import Comment from '../models/Comment.js'

// Recalculate and persist avgRating + ratingCount on the Photo document
async function refreshRating(photoId) {
  const stats = await Rating.aggregate([
    { $match: { photo: photoId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avgRating = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0
  const ratingCount = stats[0]?.count || 0
  await Photo.findByIdAndUpdate(photoId, { avgRating, ratingCount })
  return { avgRating, ratingCount }
}

export async function getPhoto(req, res, next) {
  try {
    const photo = await Photo.findById(req.params.id).populate('exhibition', 'title type visibility')
    if (!photo || photo.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Photo not found' })
    }
    res.json({ success: true, photo })
  } catch (err) {
    next(err)
  }
}

export async function ratePhoto(req, res, next) {
  try {
    const { rating } = req.body
    const value = Number(rating)
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' })
    }

    const photo = await Photo.findById(req.params.id)
    if (!photo || photo.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Photo not found' })
    }

    if (photo.submitterUser?.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot rate your own photo.' })
    }

    await Rating.findOneAndUpdate(
      { user: req.user._id, photo: photo._id },
      { rating: value },
      { upsert: true, new: true }
    )

    const { avgRating, ratingCount } = await refreshRating(photo._id)
    res.json({ success: true, avgRating, ratingCount, userRating: value })
  } catch (err) {
    next(err)
  }
}

export async function getMyRating(req, res, next) {
  try {
    const existing = await Rating.findOne({ user: req.user._id, photo: req.params.id })
    res.json({ success: true, userRating: existing?.rating || null })
  } catch (err) {
    next(err)
  }
}

export async function getComments(req, res, next) {
  try {
    const comments = await Comment.find({ photo: req.params.id }).sort({ createdAt: -1 })
    res.json({ success: true, comments })
  } catch (err) {
    next(err)
  }
}

export async function addComment(req, res, next) {
  try {
    const { text } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' })
    }

    const photo = await Photo.findById(req.params.id)
    if (!photo || photo.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Photo not found' })
    }

    const comment = await Comment.create({
      user: req.user._id,
      photo: photo._id,
      text: text.trim(),
      userName: req.user.name,
    })

    res.status(201).json({ success: true, comment })
  } catch (err) {
    next(err)
  }
}