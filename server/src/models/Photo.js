import mongoose from 'mongoose'

const photoSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    exhibition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exhibition',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Photo title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    cameraGear: {
      type: String,
      trim: true,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submitterName: {
      type: String,
      default: null,
    },
    submitterUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

photoSchema.index({ exhibition: 1, status: 1, category: 1 })
photoSchema.index({ submission: 1 })

export default mongoose.model('Photo', photoSchema)
