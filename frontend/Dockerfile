FROM node:24.11-alpine3.23

WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl ca-certificates

COPY package*.json ./

RUN npm ci
RUN mkdir .config

COPY src ./src
COPY public ./public
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

CMD ["npm", "run", "dev", "--", "--webpack"]
