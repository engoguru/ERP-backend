# # --------------------------
# # Stage 1: Build
# # --------------------------
# FROM node:20-alpine AS build

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies (only production)
# RUN npm install --production

# # Copy the rest of the source code
# COPY . .

# # --------------------------
# # Stage 2: Production image
# # --------------------------
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy everything from the build stage
# COPY --from=build /app /app

# # Expose the port your app listens on
# EXPOSE 5000

# # Start the app
# CMD ["node", "server.js"]


# --------------------------
# Stage 1: Build
# --------------------------
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# Install system dependencies for canvas
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install --omit=dev

COPY . .

# --------------------------
# Stage 2: Production image
# --------------------------
FROM node:20

WORKDIR /app

# Copy only necessary files
COPY --from=build /app /app

EXPOSE 5000

CMD ["node", "server.js"]