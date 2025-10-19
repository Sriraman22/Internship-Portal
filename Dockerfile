# Use official Node.js LTS base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy backend package files first (for caching)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY backend/ .

# Expose the port your server listens on (e.g., 8080)
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
