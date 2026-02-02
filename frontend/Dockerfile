FROM node:24.11-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY src ./src
COPY public ./public
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

CMD ["npm", "run", "dev"]