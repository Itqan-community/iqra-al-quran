# Frontend Dockerfile for Railway deployment
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for optional Vite config (NOT for API URL - using proxy)
ARG VITE_API_TIMEOUT=10000
ARG VITE_DEBUG=false

# Set them as environment variables for the build
# NOTE: VITE_API_BASE_URL is intentionally NOT set here
# The frontend will use empty string (default) which means relative URLs
# The Express server will proxy /api/* to backend at runtime
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_DEBUG=$VITE_DEBUG

# Debug: Print build configuration
RUN echo "Build configuration:" && \
    echo "✅ Using proxy approach: /api will be proxied by Express server at runtime" && \
    echo "✅ VITE_API_BASE_URL: <not set - using relative URLs>" && \
    echo "VITE_API_TIMEOUT: $VITE_API_TIMEOUT" && \
    echo "VITE_DEBUG: $VITE_DEBUG"

# Build the application with environment variables baked in
RUN npm run build

# Expose port
EXPOSE 8080

# Start Express server with health endpoint
CMD ["npm", "run", "start"]
