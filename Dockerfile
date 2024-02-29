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

# If you need to ensure python3 is used as `python`, you can create a symlink
# This is sometimes needed for scripts expecting `python` to be available
RUN ln -s /usr/bin/python3 /usr/bin/python

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
