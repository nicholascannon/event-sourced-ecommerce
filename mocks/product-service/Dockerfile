FROM node:24.12.0-alpine AS base

FROM base AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet

COPY tsconfig.json .
COPY ./src ./src

RUN npm run build
RUN npm prune --omit=dev

FROM base AS runtime
WORKDIR /opt/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

USER node

ENTRYPOINT [ "node", "." ]
