FROM node:alpine

LABEL org.opencontainers.image.source https://github.com/DulliAG/DulliBot

WORKDIR /usr/src/dullibot/

COPY package*.json ./

RUN --mount=type=secret,id=npm,target=.npmrc npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]