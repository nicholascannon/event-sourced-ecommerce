# Used for **LOCAL DEV ONLY**
FROM node:16.17.1-alpine AS build
WORKDIR /usr/src/app

COPY package*.json .
RUN npm ci

COPY scripts/ scripts/
COPY tsconfig.json .
COPY src/ src/

ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.23.2-alpine

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
