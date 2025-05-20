# frontend/Dockerfile
FROM node:18-alpine as build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Install serve package globally
RUN npm install -g serve

# Expose port 3000 (default for serve)
EXPOSE 3000

# Start the serve command
CMD ["serve", "-s", "build", "-l", "3000"]