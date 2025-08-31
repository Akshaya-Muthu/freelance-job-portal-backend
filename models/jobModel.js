import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    title: {
       type: String,
        required: true 
      },
    description: {
       type: String,
        required: true
       },
    company: { 
      type: String,
       required: true
       },
    location: { 
      type: String, 
      required: true 
    },
    salary: {
       type: Number
    },
    about:{
      type:String,
      required: true
    },
    requirements:{
     type: [String], // Array of strings
    required: true
  },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job; 