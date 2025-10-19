# Use Node.js 18 LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only backend package files and install dependencies
COPY backend/package*.json ./

# Ensure bcrypt builds for Linux inside container
RUN npm install bcrypt --build-from-source && npm install

# Copy backend source files into the container
COPY backend/ ./

# Expose backend port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
