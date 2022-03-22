FROM node:alpine

WORKDIR /home/bots/DulliBot

Copy . .

Run npm i

CMD ["npm", "start"]