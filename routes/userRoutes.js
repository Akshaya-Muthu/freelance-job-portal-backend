import express from 'express';
const router = express.Router();
import { getMyApplications } from '../controllers/userController.js';
import { protect, isCandidate } from '../middlewares/authMiddleware.js';

router.get('/my-applications', protect, isCandidate, getMyApplications);

export default router; 