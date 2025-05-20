# backend/Dockerfile
FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Production image
FROM node:24-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app .

# Set environment variables
ARG MONGO_URI
ARG NODE_ENV=production
ARG PORT=5000

ENV MONGO_URI=$MONGO_URI
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

EXPOSE $PORT
CMD ["npm", "start"]