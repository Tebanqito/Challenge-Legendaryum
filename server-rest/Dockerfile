FROM node:latest

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3001

ENV REDIS_HOST redis
ENV REDIS_PORT 6378

CMD ["npm", "start"]