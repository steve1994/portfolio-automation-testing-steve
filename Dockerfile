FROM node:20

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm ci

COPY . /app/
RUN chmod +x /app/docker.sh

USER root

RUN npx playwright install --with-deps

ENV PLAYWRIGHT_BROWSERS_PATH=0

ENTRYPOINT [ "/app/docker.sh" ]