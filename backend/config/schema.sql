-- Creative Canvas Database Schema
-- Run this script to set up the database and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS creative_canvas;
USE creative_canvas;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(500),
  project_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project images table
CREATE TABLE IF NOT EXISTS project_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  image_order INT DEFAULT 0,
  metadata JSON,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
