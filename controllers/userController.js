import Application from '../models/applicationModel.js';



const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id }).populate({
      path: 'job',
      select: 'title company location'
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

export { getMyApplications };
