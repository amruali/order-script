# Stage 1: Build the application
FROM node:22.8-slim AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Create a minimal image for production
FROM node:22.8.0-slim

# Set working directory
WORKDIR /app

# Copy built application and production dependencies from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the application port
EXPOSE 3000

# Command to start the application
CMD ["node", "dist/main"]
