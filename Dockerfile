FROM node:18.15

WORKDIR /app

RUN yarn global add pm2

COPY package.json yarn.lock /app/

RUN yarn install

COPY . /app/

EXPOSE 9000

CMD ["pm2-runtime", "server.js"]