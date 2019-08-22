FROM node:latest

COPY . .

RUN npm install

EXPOSE 18084
EXPOSE 18085

CMD npm start