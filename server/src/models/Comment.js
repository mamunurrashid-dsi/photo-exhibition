import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    userName: { type: String, required: true }, // denormalized for display
  },
  { timestamps: true }
)

commentSchema.index({ photo: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)