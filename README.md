# Creative Canvas - Full-Stack Photo Editor

A full-stack web application where users can create accounts, upload photos, edit them using basic tools, save projects, and reopen them later from a dashboard.

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)

## Features

- **User Authentication**: Register and login system
- **Photo Editor**: Upload, crop, apply filters, alignment tools
- **Collage Editor**: Drag-and-drop collage creation with templates
- **Project Management**: Save and load editing projects
- **Dashboard**: View and manage saved projects

## Tech Stack

### Frontend
- React with React Router
- Fabric.js for canvas-based editing
- react-image-crop for cropping functionality
- Axios for API calls

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- Multer for file uploads
- Sharp for image processing

## Quick Start

Choose your preferred setup method:

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd maliha-se-project

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001/api
- Database: localhost:3307

### Option 2: Local Development

#### Prerequisites
- Node.js (18+)
- MySQL (8.0+)
- npm or yarn

#### 1. Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd maliha-se-project

# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edit .env files with your configuration
```

#### 2. Bootstrap Setup
```bash
# Install all dependencies and setup database
npm run setup

# Or manually:
npm run install:all
npm run setup:db
```

#### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

#### 4. Database Setup (Alternative Manual Method)
```bash
# If not using the bootstrap script
mysql -u root -p -e "CREATE DATABASE creative_canvas;"
mysql -u root -p creative_canvas < backend/config/schema.sql
```

## Features

### Photo Editor
- **Upload**: Drag & drop or browse images (max 10MB)
- **Crop**: Interactive cropping with aspect ratio presets (1:1, 4:3, 16:9, etc.)
- **Filters**: Brightness, contrast, saturation, hue, blur, grayscale, sepia
- **Alignment**: Rotate (90°/180°/270°), flip horizontal/vertical, grid guides
- **Drawing**: Freehand drawing tools with customizable brush color and size

### Collage Editor
- **Templates**: Pre-defined layouts (2-6 images)
- **Drag & Drop**: Easy image placement into templates
- **Flexible**: Support for 2-10 images in various arrangements

### Project Management
- **Save/Load**: Projects persist in MySQL database with JSON state storage
- **Dashboard**: Grid view of saved projects with auto-generated thumbnails
- **Versioning**: Projects maintain edit history and can be reopened anytime

### User System
- **Authentication**: Secure register/login with JWT tokens
- **Security**: Password hashing with bcrypt, protected routes
- **Privacy**: Projects are private per user account

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Clean up (remove volumes)
docker-compose down -v
```

## Development Scripts

```bash
# Full project setup
npm run setup

# Install dependencies only
npm run install:all

# Setup database only
npm run setup:db

# Development mode (both frontend & backend)
npm run dev

# Production build
npm run build

# Clean project (remove node_modules and uploads)
npm run clean
```

## Environment Variables

### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=creative_canvas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Test database connection
mysql -u root -p -e "SELECT 1;"

# Reset database
npm run setup:db
```

### Docker Issues
```bash
# View container logs
docker-compose logs backend
docker-compose logs db

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build --force-recreate
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :5000
lsof -i :5173
lsof -i :3306

# Change ports in docker-compose.yml or .env
```

### Permission Issues
```bash
# Fix upload directory permissions
sudo chown -R $USER:$USER backend/uploads/

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/upload/image` - Upload image

## Project Structure

```
maliha-se-project/
├── 🐳 docker-compose.yml        # Docker orchestration
├── 🐳 nginx.conf               # Production reverse proxy
├── 📦 package.json             # Root package scripts
├── 🚫 .gitignore              # Git ignore rules
├── frontend/                  # React application
│   ├── 🐳 Dockerfile          # Frontend container config
│   ├── 🐳 nginx.conf          # Frontend nginx config
│   ├── 📦 package.json        # Frontend dependencies
│   ├── 📄 env.example         # Environment template
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
├── backend/                   # Express API
│   ├── 🐳 Dockerfile          # Backend container config
│   ├── 📦 package.json        # Backend dependencies
│   ├── 📄 env.example         # Environment template
│   ├── config/
│   │   └── schema.sql         # Database schema
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   └── setup-db.js        # Database bootstrap script
│   ├── uploads/               # File storage (gitignored)
│   └── server.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - Get all projects for logged-in user
- `GET /api/projects/:id` - Get specific project with images
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update existing project
- `DELETE /api/projects/:id` - Delete project

### Upload
- `POST /api/upload/image` - Upload image file
- `POST /api/upload/project-image` - Upload image for specific project

## Development

The application uses:
- JWT tokens for authentication (stored in localStorage)
- MySQL for data persistence
- File system for image storage
- Canvas API for client-side image processing
- RESTful API design

## License

ISC
