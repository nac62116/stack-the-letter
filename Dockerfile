# node and npm versions are defined in the .env file
ARG NODE_VERSION
ARG NPM_VERSION

FROM node:${NODE_VERSION} AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm install -g npm@${NPM_VERSION} && npm ci

FROM node:${NODE_VERSION} AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm install -g npm@${NPM_VERSION} && npm ci --omit=dev

FROM node:${NODE_VERSION} AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm install -g npm@${NPM_VERSION} && npm run build

FROM node:${NODE_VERSION}
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]