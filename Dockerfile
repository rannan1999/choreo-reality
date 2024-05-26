# Use node:alpine as the base image
FROM node:alpine

# Set the working directory
WORKDIR /home/choreouser

# Copy the current directory contents into the container at /home/choreouser
COPY . .

# Install necessary packages, create user and group, set permissions, and install npm dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache openssl curl gcompat iproute2 coreutils bash gawk sudo shadow && \
    addgroup -g 10008 choreo && \
    adduser -D -H -u 10008 -G choreo choreouser && \
    usermod -aG sudo choreouser && \
    chmod +x /home/choreouser/index.js /home/choreouser/start.sh && \
    npm install

# Specify the user to use when running this image
USER choreouser

# Run the application
CMD ["./start.sh"]
