import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createChatAfterShortlist, sendMessage, getMyChats } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", protect, createChatAfterShortlist);
router.post("/send", protect, sendMessage);
router.get("/my-chats", protect, getMyChats);

export default router;
