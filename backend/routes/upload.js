const express = require('express');
const { uploadImage, uploadImages, uploadProjectImage } = require('../controllers/uploadController');
const { uploadImage: multerUploadImage, uploadImages: multerUploadImages } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.post('/image', authenticateToken, multerUploadImage, uploadImage);
router.post('/images', authenticateToken, multerUploadImages, uploadImages);
router.post('/project-image/:projectId', authenticateToken, multerUploadImage, uploadProjectImage);

module.exports = router;
