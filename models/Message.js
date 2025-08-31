import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "ApplicationChat", required: true },
  message: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
