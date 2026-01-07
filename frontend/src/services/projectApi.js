import api from './api';

export const projectApi = {
  // Get all projects for the current user
  async getProjects(limit = 50, offset = 0) {
    try {
      const response = await api.get('/projects', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific project by ID
  async getProject(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update an existing project
  async updateProject(projectId, updateData) {
    try {
      const response = await api.put(`/projects/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a project
  async deleteProject(projectId) {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate thumbnail for a project
  async generateThumbnail(projectId) {
    try {
      const response = await api.post(`/projects/${projectId}/thumbnail`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
