import express from "express";
import { createPaymentIntent, webhookHandler, getTransactions } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/webhook", webhookHandler);
router.get("/history", protect, getTransactions);

export default router;
