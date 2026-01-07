const { getConnection } = require('../config/database');

class Project {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.thumbnail_path = data.thumbnail_path;
    this.project_data = data.project_data ? JSON.parse(data.project_data) : null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new project
  static async create(projectData) {
    const { user_id, name, thumbnail_path, project_data } = projectData;
    const projectDataJson = project_data ? JSON.stringify(project_data) : null;

    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO projects (user_id, name, thumbnail_path, project_data) VALUES (?, ?, ?, ?)',
      [user_id, name, thumbnail_path, projectDataJson]
    );

    return result.insertId;
  }

  // Find project by ID
  static async findById(id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? new Project(rows[0]) : null;
  }

  // Find all projects for a user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    return rows.map(row => new Project(row));
  }

  // Update project
  static async update(id, updateData) {
    const { name, thumbnail_path, project_data } = updateData;
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (thumbnail_path !== undefined) {
      updateFields.push('thumbnail_path = ?');
      updateValues.push(thumbnail_path);
    }

    if (project_data !== undefined) {
      updateFields.push('project_data = ?');
      updateValues.push(JSON.stringify(project_data));
    }

    if (updateFields.length === 0) {
      return false; // Nothing to update
    }

    const connection = await getConnection();
    const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    const [result] = await connection.execute(query, updateValues);
    return result.affectedRows > 0;
  }

  // Delete project
  static async delete(id) {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get project with images
  static async findWithImages(id) {
    const connection = await getConnection();

    // Get project
    const project = await this.findById(id);
    if (!project) return null;

    // Get associated images
    const [imageRows] = await connection.execute(
      'SELECT * FROM project_images WHERE project_id = ? ORDER BY image_order ASC',
      [id]
    );

    project.images = imageRows.map(row => ({
      id: row.id,
      image_path: row.image_path,
      image_order: row.image_order,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));

    return project;
  }

  // Add image to project
  static async addImage(projectId, imageData) {
    const { image_path, image_order, metadata } = imageData;
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO project_images (project_id, image_path, image_order, metadata) VALUES (?, ?, ?, ?)',
      [projectId, image_path, image_order || 0, metadataJson]
    );

    return result.insertId;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      thumbnail_path: this.thumbnail_path,
      project_data: this.project_data,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Project;
