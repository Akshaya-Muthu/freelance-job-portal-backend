import express from 'express';

const router = express.Router();

import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobsBySearch
} from '../controllers/jobController.js';

import { protect, isEmployer } from '../middlewares/authMiddleware.js';

// Public routes
router.get('/', getJobs); // Get all jobs
router.get('/my-jobs', protect, isEmployer, getMyJobs); // Get jobs posted by logged-in employer
router.get('/search', getJobsBySearch);  
router.get('/:id', getJobById); // Get single job by ID

// Protected routes for employers
router.post('/', protect, isEmployer, createJob); // Create a job
router.put('/:id', protect, isEmployer, updateJob); // Update a job
router.delete('/:id', protect, isEmployer, deleteJob); // Delete a job

export default router;
