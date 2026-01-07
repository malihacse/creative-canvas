.PHONY: help setup install db-up db-down dev build clean docker-up docker-down docker-build docker-logs test

# Default target
help: ## Show this help message
	@echo "Creative Canvas - Development Commands"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup commands
setup: ## Full project setup (install deps + setup database)
	@echo "🚀 Setting up Creative Canvas..."
	npm run setup

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm run install:all

db-setup: ## Setup database only
	@echo "🗄️ Setting up database..."
	npm run setup:db

# Development commands
dev: ## Start development servers
	@echo "🚀 Starting development servers..."
	npm run dev

dev-backend: ## Start backend only
	@echo "🚀 Starting backend server..."
	npm run dev:backend

dev-frontend: ## Start frontend only
	@echo "🚀 Starting frontend server..."
	npm run dev:frontend

# Docker commands
docker-up: ## Start all Docker services
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

docker-down: ## Stop all Docker services
	@echo "🐳 Stopping Docker services..."
	docker-compose down

docker-build: ## Build Docker images
	@echo "🏗️ Building Docker images..."
	docker-compose build

docker-logs: ## Show Docker logs
	@echo "📋 Showing Docker logs..."
	docker-compose logs -f

docker-clean: ## Clean Docker (remove containers, volumes, images)
	@echo "🧹 Cleaning Docker..."
	docker-compose down -v --rmi all

# Build commands
build: ## Build for production
	@echo "🏗️ Building for production..."
	npm run build

# Maintenance commands
clean: ## Clean project (remove node_modules, uploads, builds)
	@echo "🧹 Cleaning project..."
	npm run clean
	rm -rf frontend/dist backend/uploads/* backend/uploads/thumbnails/*

clean-deps: ## Remove all node_modules
	@echo "🧹 Removing dependencies..."
	rm -rf backend/node_modules frontend/node_modules node_modules

# Database commands
db-reset: ## Reset database (drop and recreate)
	@echo "🔄 Resetting database..."
	docker-compose exec db mysql -u root -prootpassword -e "DROP DATABASE IF EXISTS creative_canvas; CREATE DATABASE creative_canvas;"
	docker-compose exec backend npm run setup:db

# Testing commands
test: ## Run tests (when implemented)
	@echo "🧪 Running tests..."
	@echo "Tests not yet implemented"

# Utility commands
status: ## Show status of services
	@echo "📊 Service Status:"
	@echo "Docker containers:"
	@docker-compose ps
	@echo ""
	@echo "Running processes:"
	@ps aux | grep -E "(node|npm)" | grep -v grep || echo "No Node.js processes running"

logs-backend: ## Show backend logs
	@echo "📋 Backend logs:"
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	@echo "📋 Frontend logs:"
	docker-compose logs -f frontend
