const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../uploads/thumbnails')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '../uploads/images');
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(__dirname, '../uploads/thumbnails');
    } else {
      uploadPath = path.join(__dirname, '../uploads/images');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, basename + '-' + uniqueSuffix + extension);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Single image upload
const uploadImage = upload.single('image');

// Multiple images upload (for collage)
const uploadImages = upload.array('images', 10); // Max 10 images

// Thumbnail upload
const uploadThumbnail = upload.single('thumbnail');

module.exports = {
  uploadImage,
  uploadImages,
  uploadThumbnail
};
