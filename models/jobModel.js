import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number },
    about: { type: String, required: true },
    requirements: { type: [String], required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

    // ✅ Reviews
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
