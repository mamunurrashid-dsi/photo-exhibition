import User from '../models/User.js'
import Photo from '../models/Photo.js'
import Exhibition from '../models/Exhibition.js'

export async function getPublicProfile(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('name bio avatarUrl createdAt')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const [photos, exhibitions] = await Promise.all([
      Photo.find({ submitterUser: req.params.id, status: 'approved' })
        .select('title thumbnailUrl imageUrl avgRating ratingCount exhibition')
        .sort({ createdAt: -1 }),
      Exhibition.find({ createdBy: req.params.id, visibility: 'public', status: 'active' })
        .select('title type organizerName coverImageUrl status submissionStartDate submissionEndDate exhibitionStartDate exhibitionEndDate categories createdBy')
        .sort({ createdAt: -1 }),
    ])

    res.json({ success: true, user, photos, exhibitions })
  } catch (err) {
    next(err)
  }
}
