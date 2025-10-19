# Use Node 20 (required for Azure SDKs)
FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY backend/ ./

EXPOSE 8080

CMD ["npm", "start"]
