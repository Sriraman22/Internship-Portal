# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy backend package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies for backend
RUN npm install

# Copy the entire backend folder contents into the container
COPY backend/ ./

# Expose port 8080 for your backend
EXPOSE 8080

# Run your backend server
CMD ["node", "server.js"]
