FROM node:16.17.1-alpine AS base

FROM base AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY ./pkg ./pkg
COPY ./order-service ./order-service
COPY tsconfig.json .

RUN npm run format:check
RUN npm run build:order-service
RUN npm test

FROM base AS runtime
WORKDIR /opt/app

COPY --from=build /usr/src/app/bin ./bin
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

USER node

ENTRYPOINT [ "node", "./bin/order-service" ]
