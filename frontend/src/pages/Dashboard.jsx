import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { projectApi } from '../services/projectApi';
import { getImageUrl } from '../utils/config';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // For now, just set empty array
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    navigate('/editor');
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectApi.deleteProject(projectId);
      // Reload projects
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Creative Canvas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <button
              onClick={handleCreateProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create New Project
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No projects yet</div>
              <p className="text-gray-400 mb-8">
                Start creating your first photo editing project!
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {project.thumbnail_path ? (
                      <img
                        src={getImageUrl(project.thumbnail_path)}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Preview
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        to={`/editor/${project.id}`}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
