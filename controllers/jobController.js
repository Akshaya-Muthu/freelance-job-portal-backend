import Job from '../models/jobModel.js';

// @desc Get all jobs
const getJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    const query = {};

    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(query).populate('postedBy', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get single job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (job) res.json(job);
    else res.status(404).json({ message: 'Job not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Create a job
const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, requirements, about } = req.body;
    if (!title || !description || !company || !location || !requirements || !about) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    if (req.user.role !== 'recruiter') {
      return res.status(401).json({ message: 'Not authorized as a recruiter' });
    }

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      requirements,
      about,
      applications: [],
      postedBy: req.user._id,
    });

    const createdJob = await job.save();
    res.status(201).json({ message: "Created Job successfully", createdJob });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

// @desc Update a job
const updateJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.company = company || job.company;
    job.location = location || job.location;
    job.salary = salary || job.salary;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

// @desc Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

// @desc Get jobs posted by a recruiter
const getMyJobs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(401).json({ message: 'Not authorized as a recruiter' });
    }
    const jobs = await Job.find({ postedBy: req.user._id });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs', error: error.message });
  }
};

// @desc Search jobs
const getJobsBySearch = async (req, res) => {
  try {
    const { keyword, location, company } = req.query;
    const query = {};

    if (!keyword && !location && !company) {
      return res.status(400).json({ message: 'Please provide a search keyword or location' });
    }
    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };

    const jobs = await Job.find(query).populate('postedBy', 'name email');
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found matching your criteria' });
    }
    res.status(200).json({ message: "Jobs fetched successfully", jobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search jobs', error: error.message });
  }
};

export { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs, getJobsBySearch };
