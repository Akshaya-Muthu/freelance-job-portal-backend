import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    enum: ['Intermediate', 'Graduate', 'Post Graduate'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'interview', 'selected', 'rejected'],
    default: 'pending',
  },
  applied:{
    type: Boolean,
    default: false,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobSnapshot: {
      title: String,
      company: String,
      location: String,
      salary: String,
    },
    applicants: [applicantSchema],
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
