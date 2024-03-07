FROM --platform=$BUILDPLATFORM node:lts-alpine as base
WORKDIR /app
COPY package.json /
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD npm run start

FROM base as prod
ENV NODE_ENV=production
RUN npm install
COPY . /app
CMD node index.js