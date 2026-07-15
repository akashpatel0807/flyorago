# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for compiling TypeScript
COPY package*.json ./
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy schema.sql for automatic startup database initialization
COPY --from=builder /usr/src/app/src/database/schema.sql ./dist/database/schema.sql

# Expose backend port
EXPOSE 5000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "dist/server.js"]
