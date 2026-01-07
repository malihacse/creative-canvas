const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = req.file.path;
    const filename = req.file.filename;
    const relativePath = `/uploads/images/${filename}`;

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: filename,
        path: relativePath,
        fullPath: imagePath,
        size: req.file.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Upload multiple images (for collage)
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();
        return {
          filename: file.filename,
          path: `/uploads/images/${file.filename}`,
          fullPath: file.path,
          size: file.size,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        };
      })
    );

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// Generate thumbnail from image
const generateThumbnail = async (imagePath, thumbnailPath, size = 300) => {
  try {
    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return true;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return false;
  }
};

// Upload image for specific project
const uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const imagePath = req.file.path;
    const filename = req.file.filename;
    const relativePath = `/uploads/images/${filename}`;

    // Generate thumbnail
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailFilename);
    const thumbnailSuccess = await generateThumbnail(imagePath, thumbnailPath);

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();

    const imageData = {
      filename: filename,
      path: relativePath,
      fullPath: imagePath,
      thumbnailPath: thumbnailSuccess ? `/uploads/thumbnails/${thumbnailFilename}` : null,
      size: req.file.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      projectId: parseInt(projectId)
    };

    res.json({
      success: true,
      message: 'Project image uploaded successfully',
      data: imageData
    });
  } catch (error) {
    console.error('Project image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload project image'
    });
  }
};

// Delete uploaded file
const deleteUploadedFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadProjectImage,
  generateThumbnail,
  deleteUploadedFile
};
