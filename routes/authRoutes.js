import express from 'express';
import { protect } from '../middlewares/authMiddleware.js'
import { registerUser, loginUser,roleSelection,updateProfile, guestLogin,sendVerifyOtp,verifyEmail,resetPassword,sendResetOtp,isAuthenticated } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/role-selection',protect,roleSelection)
router.put('/updateProfile', protect, updateProfile ); 
router.post('/guest-login', guestLogin);  
router.post("/send-verify-otp", sendVerifyOtp);
router.post("/verify-account", verifyEmail);
router.get("/is-auth",  isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);


export default router; 