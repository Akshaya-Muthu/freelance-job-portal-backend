import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resume",                  // Folder in Cloudinary
    resource_type: "raw",               // Required for PDFs
    format: "pdf",                      // Ensure .pdf extension
    type: "upload",                     // Force upload type
    public_id: (req, file) => 
       Date.now() + "-resume",
  },
});

// Validate only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;
