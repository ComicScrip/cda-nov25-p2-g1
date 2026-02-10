FROM node:24.11-alpine3.23

WORKDIR /app

# Install curl for healthchecks
# RUN apk add --no-cache curl ca-certificates

COPY package*.json ./

# Pour ne pas réécrire le package-lock.json
RUN npm ci

COPY src ./src
COPY tsconfig.json ./tsconfig.json

CMD ["npm", "run", "dev"]