# Use the official Node.js 18 image as a parent image
FROM node:18.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any system dependencies required by your node modules
# For Debian/Ubuntu-based images
RUN apt-get update && apt-get install -y \
    build-essential \
    python2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to work directory
COPY package*.json ./

# Install Node.js dependencies defined in package.json
RUN npm install --build-from-source

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run the specified command within the container.
CMD [ "node", "dist/main.js" ]
