# Use the official lightweight Node.js 18 image.
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Canvas dependencies
RUN apk add --no-cache \
    libc6-compat \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig \
    make \
    g++ \
    python3

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV SKIP_DB_VALIDATION=true

# Build the application
RUN npm run build

# Remove the build-only environment variable
ENV SKIP_DB_VALIDATION=

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
