const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  generateProjectThumbnail
} = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Thumbnail generation endpoint
router.post('/:id/thumbnail', generateProjectThumbnail);

module.exports = router;
