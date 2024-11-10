# project/packages/api/Dockerfile

FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Copy all package.json files
COPY ../../package*.json ./
COPY ../../packages/types/package*.json ./packages/types/
COPY ../../packages/api/package*.json ./packages/api/

# Copy source files
COPY ../../packages/types/src ./packages/types/src
COPY ../../packages/types/tsconfig*.json ./packages/types/
COPY ../../packages/api/src ./packages/api/src
COPY ../../packages/api/tsconfig.json ./packages/api/

# Install all dependencies
RUN npm install

# Build packages (now with both ESM and CJS builds)
RUN npm run build:types
RUN npm run build:api

# Production image
FROM node:20.9.0-alpine

# Add tini for proper signal handling
RUN apk add --no-cache tini

WORKDIR /app

# Copy workspace configuration and built files
COPY ../../package*.json ./
COPY ../../packages/api/package*.json ./packages/api/
COPY ../../packages/types/package*.json ./packages/types/
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Install dependencies at workspace root
RUN npm install --production --workspace=@wl-image-canvas/api --workspace=@wl-image-canvas/types

WORKDIR /app/packages/api

# Set user for security
USER node

# Expose port
EXPOSE 3000

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start the app
CMD ["node", "dist/app.js"]