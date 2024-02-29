# Use the official Node.js 18 image as a parent image
FROM node:18.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies required for your node modules
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

# Create a symlink for python if necessary
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy package.json and package-lock.json (if available) to the work directory
COPY package*.json ./

# Install Node.js dependencies defined in package.json
RUN npm install --build-from-source

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Run your "makeJS" script to compile TypeScript to JavaScript
RUN npm run makeJS

# Make port 80 available to the world outside this container
EXPOSE 80

# Command to run your application
CMD [ "node", "dist/main.js" ]
