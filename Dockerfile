# --- Stage 1: Build the Next.js application ---
FROM node:18-slim AS builder
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Pass the API key as a build argument
ARG GEMINI_API_KEY

# Build the Next.js application with the API key
RUN npm run build

# --- Stage 2: Create a minimal production image ---
FROM node:18-slim AS runner
WORKDIR /app

# Set environment variables for production and the API key
ENV NODE_ENV production
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Copy necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]