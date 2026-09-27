# Multi-stage Docker build for CollabCode Platform

# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine
WORKDIR /app

# Install Python & build tools for native SQLite
RUN apk add --no-cache python3 py3-pip make g++ bash

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

# Expose HTTP and WebSocket port
EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["npx", "tsx", "server/src/index.ts"]
