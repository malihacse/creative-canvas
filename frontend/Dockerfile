# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration to conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5173 (Vite dev server default)
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
