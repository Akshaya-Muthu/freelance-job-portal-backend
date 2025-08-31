import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "interview", "rejected", "selected"], default: "pending" },
  resumeUrl: { type: String },
  education: { type: String },
  yearsOfExperience: { type: Number },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
