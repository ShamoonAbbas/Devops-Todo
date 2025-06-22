# Use Node.js 18 LTS as base image
FROM node:18-slim

# Install necessary dependencies for Chrome and Selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app/testcases

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy test files and configuration
COPY . .

# Create necessary directories
RUN mkdir -p screenshots test-results logs

# Set display environment variable for headless Chrome
ENV DISPLAY=:99

# Expose port for potential test reporting server
EXPOSE 3001

# Default command to run all tests
CMD ["npm", "test"]

# Alternative commands can be:
# CMD ["npm", "run", "test:report"]  # Run with detailed reporting
# CMD ["node", "run-tests.js"]      # Run with custom test runner
