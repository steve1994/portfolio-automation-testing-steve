FROM node:20

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV BASE_URL=https://www.emra.chat
ENV CI=true
ENV WORKERS=6
ENV RETRY=1

COPY package*.json ./
RUN npm ci

RUN npx playwright install --with-deps
