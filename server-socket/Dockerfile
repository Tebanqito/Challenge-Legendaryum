FROM node:latest

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000

ENV REDIS_HOST redis
ENV REDIS_PORT 6379

CMD ["npm", "start"]