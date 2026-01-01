FROM node:24.12.0-alpine AS base

FROM base AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY ./pkg ./pkg
COPY ./checkout-pm ./checkout-pm
COPY tsconfig.json .

RUN npm run format:check
RUN npm run build:checkout-pm
RUN npm run test:pkg
RUN npm run test:checkout-pm

FROM base AS runtime
WORKDIR /opt/app

COPY --from=build /usr/src/app/bin ./bin
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

USER node

ENTRYPOINT [ "node", "./bin/checkout-pm" ]
