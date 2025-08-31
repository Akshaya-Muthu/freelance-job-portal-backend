import Application from "../models/Application.js";
import ApplicationChat from "../models/ApplicationChat.js";
import Message from "../models/Message.js";

// Create chat when candidate is selected
export const createChatAfterShortlist = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId).populate("candidate recruiter");
    if (!application) return res.status(404).json({ error: "Application not found" });

    if (application.status !== "selected")
      return res.status(403).json({ error: "Candidate not selected yet" });

    let chat = await ApplicationChat.findOne({ application: applicationId });
    if (!chat) {
      chat = await ApplicationChat.create({
        application: applicationId,
        participants: [application.candidate._id, application.recruiter._id],
      });
    }

    res.json(chat);
  } catch (error) {
    console.error("Chat creation error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send message (REST fallback)
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const chat = await ApplicationChat.findById(chatId).populate("participants");
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString()))
      return res.status(403).json({ error: "Not a participant" });

    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      message: content,
    });

    chat.latestMessage = message._id;
    await chat.save();

    const populatedMessage = await message.populate("sender", "name email");
    if (req.io) {
      chat.participants.forEach(p => {
        if (p._id.toString() !== req.user._id.toString()) {
          req.io.to(p._id.toString()).emit("message-received", populatedMessage);
        }
      });
    }

    res.json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get chats of candidate
export const getMyChats = async (req, res) => {
  try {
    const chats = await ApplicationChat.find({ participants: req.user._id })
      .populate("participants", "name email")
      .populate("application");
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
