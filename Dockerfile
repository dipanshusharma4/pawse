# Use an official Node.js runtime as the base image
FROM node:18-slim

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on (Cloud Run defaults to 8080)
EXPOSE 8080

# Run the application
CMD ["npm", "start"]