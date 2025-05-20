# backend/Dockerfile
FROM node:24-alpine
WORKDIR /app

# Build arguments
ARG MONGO_URI

# Set environment variables
ENV MONGO_URI=$MONGO_URI

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5000
CMD ["npm", "start"]