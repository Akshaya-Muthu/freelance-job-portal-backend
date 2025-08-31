import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { addReview, getReviews, respondReview } from '../controllers/reviewController.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Client posts a review for a freelancer
// @access  Private (client)
router.post('/', protect, addReview);

// @route   GET /api/reviews/:freelancerId
// @desc    Get all reviews for a specific freelancer
// @access  Public
router.get('/:freelancerId', getReviews);

// @route   PUT /api/reviews/respond/:id
// @desc    Freelancer responds to a review
// @access  Private (freelancer)
router.put('/respond/:id', protect, respondReview);

export default router;
