import express from 'express';
import {
  applyToJob,
  getJobApplicants,
  getAlreadyApplied,
  getMyApplication,
  getMyJob
} from '../controllers/applicationController.js';
import { protect, isCandidate, isEmployer } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import { updateApplicationStatus } from '../controllers/applicationController.js';


const router = express.Router();

router.route('/:jobId/apply').post(protect, isCandidate, upload.single('resume'), applyToJob);
router.route('/:jobId/check').get(protect, getAlreadyApplied);
router.route('/myApplication').get(protect, getMyApplication);


// Employer routes
router.route('/myjobs').get(protect, isEmployer, getMyJob); // Assuming this is to get jobs posted by the employer

router.route('/:jobId/applicants').get(protect, isEmployer, getJobApplicants);
router.route('/:jobId/:applicantId').put(protect, isEmployer, updateApplicationStatus);

export default router; 
