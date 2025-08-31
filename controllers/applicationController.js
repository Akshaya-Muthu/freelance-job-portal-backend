import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import Job from "../models/jobModel.js";
import Application from "../models/applicationModel.js";
import { error } from "console";


// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private/Jobseeker
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { yearsOfExperience, skills, education } = req.body;
    const applicantId = req.user?._id;

    if (!applicantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (!yearsOfExperience || !skills || !education) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find existing application document for this job
    let applicationDoc = await Application.findOne({ job: jobId });

    // If no application doc exists for this job, create one
    if (!applicationDoc) {
      applicationDoc = new Application({ job: jobId, applicants: [] });
    }

    // Check if user already applied
    const alreadyApplied = applicationDoc.applicants.some(
      (app) => app.user.toString() === applicantId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Push applicant details
    applicationDoc.applicants.push({
      user: applicantId,
      resumeUrl: req.file.path, // keep same resume upload logic
      yearsOfExperience,
      skills,
      jobSnapshot: {
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
      },
      education,
      status: "pending",
      applied: true,
      appliedAt: new Date(),
    });

    await applicationDoc.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application: applicationDoc,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/applications/:jobId/applicants
// @access  Private/Employer
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Ensure only employer who posted can view applicants
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to view applicants for this job" });
    }

    const applicationDoc = await Application.findOne({ job: jobId })
      .populate("applicants.user", "name email");

    if (!applicationDoc) {
      return res.json({ applicants: [] });
    }

    res.json(applicationDoc.applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:jobId/:applicantId/status
// @access  Private/Employer
// route: PUT /api/applications/:jobId/:applicantId
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const { jobId, applicantId } = req.params;


  try {
    const applicationDoc = await Application.findOne({ job: jobId });
    if (!applicationDoc) {
      // console.log(" Backend: Application record not found for job:", jobId);
      return res.status(404).json({ message: "Application record not found" });
    }

    

    const applicant = applicationDoc.applicants.find(
      (app) => app.user.toString() === applicantId.toString()
    );

    if (!applicant) {
      
      return res.status(404).json({ message: "Applicant not found" });
    }

    applicant.status = status;
    await applicationDoc.save();


    res.json({ message: "Application status updated", applicant });
  } catch (error) {
    console.error(" Backend: Error updating status:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};



const getAlreadyApplied = async (req, res) => {
  const { jobId } = req.params;
  const applicantId = req.user?._id;
  if (!applicantId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{
    const applicationDoc = await Application.findOne({ job: jobId });
    if (!applicationDoc) {
      return res.status(404).json({ message: "Application record not found" });
    }

    const alreadyApplied = applicationDoc.applicants.some(
      (app) => app.user.toString() === applicantId.toString()
    );

    res.json({ alreadyApplied });
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

}

const getMyApplication = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find applications where applicants array contains this user
    const applications = await Application.find({ "applicants.user": userId },{ applicants: { $elemMatch: { user: userId } } } ).populate("applicants.user", "name email").populate("job");

      // console.log(applications.applicants);

    res.status(200).json({
      message: "My applications",
      applications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


const getMyJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    if (!recruiterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all jobs posted by this recruiter with full details
    const jobs = await Job.find({ postedBy: recruiterId });

    if (!jobs.length) {
      return res.status(200).json({ 
        message: "No jobs found for this recruiter",
        jobs: []
      });
    }

    const jobIds = jobs.map(job => job._id);

    // Find applications for these jobs and populate necessary fields
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title company location salary description about requirements")
      .populate("applicants.user", "name email resumeUrl")
      .lean();

    // console.log("Raw applications data:", applications);

    // Create a map of jobId to applications for easy lookup
    const applicationsMap = new Map();
    applications.forEach(app => {
      applicationsMap.set(app.job._id.toString(), app);
    });

    // Structure the response to include job details and applicants
    const detailedJobs = jobs.map(job => {
      const jobApplication = applicationsMap.get(job._id.toString());
      
      return {
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        description: job.description,
        about: job.about,
        requirements: job.requirements,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        // Include applicant information for this specific job
        applicants: jobApplication ? jobApplication.applicants.map(applicant => ({
          userId: applicant.user._id,
          userName: applicant.user.name,
          userEmail: applicant.user.email,
          resumeUrl: applicant.resumeUrl,
          yearsOfExperience: applicant.yearsOfExperience,
          skills: applicant.skills,
          education: applicant.education,
          status: applicant.status,
          appliedAt: applicant.appliedAt
        })) : [],
        totalApplicants: jobApplication ? jobApplication.applicants.length : 0,
        hasApplications: !!jobApplication
      };
    });

    res.status(200).json({
      message: "Recruiter jobs and applications retrieved successfully",
      totalJobs: jobs.length,
      jobs: detailedJobs
    });

  } catch (err) {
    console.error("Error in getMyJob:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

export { applyToJob, getJobApplicants, updateApplicationStatus,getAlreadyApplied,getMyApplication,getMyJob };
