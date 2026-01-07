const Project = require('../models/Project');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Get all projects for the authenticated user
 */
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const projects = await Project.findByUserId(userId, limit, offset);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
};

/**
 * Get a specific project with all its images
 */
const getProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findWithImages(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to user
    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project'
    });
  }
};

/**
 * Create a new project
 */
const createProject = async (req, res) => {
  try {
    const { name, project_data } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const projectId = await Project.create({
      user_id: userId,
      name: name.trim(),
      project_data: project_data || null
    });

    const project = await Project.findById(projectId);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

/**
 * Update an existing project
 */
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { name, project_data } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (existingProject.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (project_data !== undefined) updateData.project_data = project_data;

    const success = await Project.update(projectId, updateData);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update project'
      });
    }

    const updatedProject = await Project.findById(projectId);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

/**
 * Delete a project
 */
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if project exists and belongs to user
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (existingProject.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const success = await Project.delete(projectId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project'
      });
    }

    // TODO: Clean up associated files (images, thumbnails)

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

/**
 * Generate thumbnail for a project
 */
const generateProjectThumbnail = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', `project-${projectId}.png`);

    // Try to generate thumbnail from project data
    if (project.project_data && project.project_data.images && project.project_data.images.length > 0) {
      try {
        // Use the first image from the project as thumbnail
        const firstImage = project.project_data.images[0];
        if (firstImage && firstImage.path) {
          const imagePath = path.join(__dirname, '..', firstImage.path);

          if (fs.existsSync(imagePath)) {
            await sharp(imagePath)
              .resize(300, 200, {
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ quality: 80 })
              .toFile(thumbnailPath);
          } else {
            throw new Error('Image file not found');
          }
        } else {
          throw new Error('No valid image found');
        }
      } catch (imageError) {
        console.warn('Failed to generate thumbnail from image, using fallback:', imageError.message);
        // Fallback to colored thumbnail
        await sharp({
          create: {
            width: 300,
            height: 200,
            channels: 4,
            background: { r: 100, g: 149, b: 237, alpha: 1 } // Cornflower blue
          }
        })
          .png()
          .toFile(thumbnailPath);
      }
    } else {
      // No project data, create a simple colored thumbnail
      await sharp({
        create: {
          width: 300,
          height: 200,
          channels: 4,
          background: { r: 100, g: 149, b: 237, alpha: 1 } // Cornflower blue
        }
      })
        .png()
        .toFile(thumbnailPath);
    }

    // Update project with thumbnail path
    const relativeThumbnailPath = `/uploads/thumbnails/project-${projectId}.png`;
    await Project.update(projectId, { thumbnail_path: relativeThumbnailPath });

    res.json({
      success: true,
      message: 'Thumbnail generated successfully',
      thumbnail_path: relativeThumbnailPath
    });
  } catch (error) {
    console.error('Generate thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate thumbnail'
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  generateProjectThumbnail
};
