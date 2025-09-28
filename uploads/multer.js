require("dotenv").config();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "uploads", // Folder in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });
  
  const upload = multer({ storage });
  module.exports = { upload }; // Make sure you are exporting `upload`