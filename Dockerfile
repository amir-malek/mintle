FROM node:18.15

WORKDIR /app

COPY . /app/

# RUN npm install -g pm2
RUN yarn global add pm2

RUN yarn install

ENV NODE_ENV production

EXPOSE 9000

CMD ["pm2-runtime", "server.js"]