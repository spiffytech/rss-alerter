FROM node:alpine

RUN apk add python alpine-sdk

WORKDIR /app
ADD package.json package-lock.json /app/
RUN npm install
ADD . /app
RUN npm install

CMD node index.js
