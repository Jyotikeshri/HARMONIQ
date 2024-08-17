import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/images", // Folder in Cloudinary for images
    format: async (req, file) => {
      // Ensure the uploaded file is an image
      const fileType = file.mimetype.split("/")[0];
      if (fileType === "image") {
        return file.mimetype.split("/")[1];
      } else {
        throw new Error("Invalid image file type");
      }
    },
    public_id: (req, file) => file.originalname.split(".")[0], // Use original file name without extension
  },
});

// Create a Cloudinary storage for other file types
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/files", // Folder in Cloudinary for files
    resource_type: "auto", // Automatically detect file type
    public_id: (req, file) => file.originalname.split(".")[0], // Use original file name without extension
  },
});

// Initialize Multer with the storages
const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

export { cloudinary, uploadImage, uploadFile };
