FROM node:17-slim

WORKDIR /usr/src/app

COPY .yarn .yarn/
COPY .yarnrc.yml ./

COPY package.json yarn.lock ./
COPY packages/server/package.json packages/server/
COPY packages/frontend/package.json packages/frontend/

RUN yarn

COPY . ./

RUN yarn build

ENTRYPOINT yarn start
