import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
)

ratingSchema.index({ user: 1, photo: 1 }, { unique: true })

export default mongoose.model('Rating', ratingSchema)