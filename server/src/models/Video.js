import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  targetRole: {
    type: String,
    enum: ['patient', 'caregiver', 'both'],
    required: true,
    default: 'both'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;
