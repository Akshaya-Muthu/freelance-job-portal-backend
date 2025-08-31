import Review from '../models/reviewModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// Add Review
export const addReview = async (req,res) => {
  try{
    const { freelancerId, rating, comment } = req.body;
    const review = new Review({
      freelancerId,
      clientId: req.user._id,
      rating,
      comment
    });
    await review.save();

    // Update freelancer rating
    const reviews = await Review.find({ freelancerId });
    const avgRating = reviews.reduce((acc,r)=>acc+r.rating,0)/reviews.length;
    await User.findByIdAndUpdate(freelancerId,{ rating: avgRating });

    // Create notification
    await Notification.create({
      userId: freelancerId,
      type: 'review-received',
      referenceId: review._id,
      message: `You received a new review from ${req.user.name}`
    });

    res.status(201).json(review);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

// Freelancer responds to review
export const respondReview = async (req,res) => {
  try{
    const review = await Review.findById(req.params.id);
    if(!review) return res.status(404).json({ message: 'Review not found' });
    if(review.freelancerId.toString() !== req.user._id.toString())
      return res.status(401).json({ message:'Not authorized' });

    review.response = req.body.response;
    await review.save();

    // Notify client
    await Notification.create({
      userId: review.clientId,
      type: 'review-responded',
      referenceId: review._id,
      message: `${req.user.name} responded to your review`
    });

    res.status(200).json(review);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

// Get reviews for a freelancer
export const getReviews = async (req,res) => {
  try{
    const reviews = await Review.find({ freelancerId: req.params.freelancerId })
      .populate('clientId','name');
    res.status(200).json(reviews);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}
