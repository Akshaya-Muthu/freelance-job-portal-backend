import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  response: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
