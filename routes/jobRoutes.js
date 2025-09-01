import express from 'express';
const router = express.Router();

import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobsBySearch,
  addJobReview,
  getJobReviews
} from '../controllers/jobController.js';

import { protect, isEmployer } from '../middlewares/authMiddleware.js';

// -------------------- Public Routes --------------------
// Get all jobs
router.get('/', getJobs);

// Get jobs posted by logged-in employer
router.get('/my-jobs', protect, isEmployer, getMyJobs);

// Search jobs
router.get('/search', getJobsBySearch);

// Get single job by ID
router.get('/:id', getJobById);

// Get all reviews for a job
router.get('/:id/reviews', getJobReviews);

// -------------------- Protected Routes (Employer) --------------------
// Create a job
router.post('/', protect, isEmployer, createJob);

// Update a job
router.put('/:id', protect, isEmployer, updateJob);

// Delete a job
router.delete('/:id', protect, isEmployer, deleteJob);

// -------------------- Protected Routes (Any Logged-in User) --------------------
// Add a review to a job
router.post('/:id/reviews', protect, addJobReview);

export default router;
