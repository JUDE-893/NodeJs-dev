FROM node:18-bullseye

# Install Chromium with dependencies
RUN apt-get update && \
    apt-get install -y \
    chromium \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Configure Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src

EXPOSE 5000
CMD ["npm", "start"]
