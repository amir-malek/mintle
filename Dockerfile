FROM node:latest

WORKDIR /app

COPY . /app/

RUN npm install -g pm2

RUN yarn install

ENV NODE_ENV dev

EXPOSE 9000

CMD ["pm2-runtime", "server.js"]