import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  amount: { type: Number, required: true }, // in cents
  status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
  milestone: { type: String, default: "full" },
  paymentId: { type: String },
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
