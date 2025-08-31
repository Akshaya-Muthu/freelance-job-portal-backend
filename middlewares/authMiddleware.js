import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const isEmployer = (req, res, next) => {
  if (req.user?.role === 'recruiter') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a recruiter' });
  }
};

const isCandidate = (req, res, next) => {
  if (req.user?.role === 'candidate') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a candidate' });
  }
};

export { protect, isEmployer, isCandidate };
