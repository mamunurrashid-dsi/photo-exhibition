import mongoose from 'mongoose'

const exhibitionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['online', 'offline'],
      required: [true, 'Exhibition type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    coverImagePublicId: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    privateToken: {
      type: String,
      sparse: true,
      unique: true,
      default: null,
    },
    allowedEmailDomain: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    categories: {
      type: [String],
      default: [],
    },
    submissionStartDate: {
      type: Date,
      default: null,
    },
    submissionEndDate: {
      type: Date,
      default: null,
    },
    venue: {
      address: String,
      city: String,
      country: String,
    },
    exhibitionStartDate: {
      type: Date,
      default: null,
    },
    exhibitionEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
)

exhibitionSchema.index({ type: 1, visibility: 1, status: 1 })
exhibitionSchema.index({ createdBy: 1 })
exhibitionSchema.index({ submissionEndDate: 1 })

export default mongoose.model('Exhibition', exhibitionSchema)
