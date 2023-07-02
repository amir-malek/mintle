FROM node:18.15

WORKDIR /app

COPY . /app/

# RUN npm install -g pm2
RUN yarn global add pm2

RUN yarn install

RUN npx hardhat compile

ENV NODE_ENV dev

EXPOSE 9000

CMD ["pm2-runtime", "server.js"]