import Notification from '../models/notificationModel.js';

export const getNotifications = async (req,res) => {
  try{
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt:-1 });
    res.status(200).json(notifications);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

export const markRead = async (req,res) => {
  try{
    const notification = await Notification.findById(req.params.id);
    if(!notification) return res.status(404).json({ message:'Not found' });
    if(notification.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message:'Not authorized' });

    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}
