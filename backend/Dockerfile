FROM node:24.11-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY src ./src
COPY tsconfig.json ./tsconfig.json

CMD ["npm", "run", "dev"]