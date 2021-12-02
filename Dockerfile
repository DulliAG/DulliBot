FROM node:alpine

WORKDIR /var/www/DulliBot

Copy . .

Run npm i

CMD ["npm", "start"]