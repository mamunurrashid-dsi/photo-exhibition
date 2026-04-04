import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    exhibition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exhibition',
      required: true,
    },
    submitterName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    submitterEmail: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    instagramHandle: {
      type: String,
      trim: true,
      default: null,
    },
    termsAccepted: {
      type: Boolean,
      required: [true, 'You must accept the terms and conditions'],
      validate: {
        validator: (v) => v === true,
        message: 'You must accept the terms and conditions',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

submissionSchema.index({ exhibition: 1, status: 1 })
submissionSchema.index({ submitterEmail: 1 })

export default mongoose.model('Submission', submissionSchema)
