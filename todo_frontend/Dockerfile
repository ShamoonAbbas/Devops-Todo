# frontend/Dockerfile
FROM node:18-alpine as build
WORKDIR /app

# Build arguments
ARG REACT_APP_API_URL
ARG WDS_SOCKET_PORT

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV WDS_SOCKET_PORT=$WDS_SOCKET_PORT

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