FROM mcr.microsoft.com/playwright:v1.40.0-jammy

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.js ./
COPY configManager.js ./
COPY server.js ./
COPY config ./config

EXPOSE 3000

CMD ["node", "server.js"]
