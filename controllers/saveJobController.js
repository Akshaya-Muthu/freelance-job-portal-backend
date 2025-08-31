import User from "../models/userModel.js";

 const saveJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user._id;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }
    
        if (user.savejobs.includes(jobId)) {
        return res.status(400).json({ message: "Job already saved" });
        }
    
        user.savejobs.push(jobId);
        await user.save();
    
        res.status(201).json({ message: "Job saved successfully", savejobs: user.savejobs });
    } catch (error) {
        res.status(500).json({ message: "Failed to save job", error: error.message });
    }
}

const getSaveJob = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).populate('savejobs');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ savejobs: user.savejobs });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch saved jobs", error: error.message });
    }
}

const unsaveJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.savejobs.includes(jobId)) {
            return res.status(400).json({ message: "Job not saved" });
        }

        user.savejobs.pull(jobId);
        await user.save();

        res.status(200).json({ message: "Job unsaved successfully", savejobs: user.savejobs });
    } catch (error) {
        res.status(500).json({ message: "Failed to unsave job", error: error.message });
    }
}

export { saveJob, getSaveJob, unsaveJob };