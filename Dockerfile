FROM node:alpine

RUN apk add python alpine-sdk

WORKDIR /app
ADD . /app
RUN npm install

CMD node index.js
