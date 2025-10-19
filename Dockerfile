# Use Node 20 (matches your runtime)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only backend package files first
COPY backend/package*.json ./

# Clean npm cache, install build tools, and rebuild bcrypt for Linux
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev \
    && npm rebuild bcrypt --build-from-source \
    && apk del python3 make g++

# Copy backend source files
COPY backend/ ./

# Expose port 8080 for backend
EXPOSE 8080

# Start the backend
CMD ["npm", "start"]
