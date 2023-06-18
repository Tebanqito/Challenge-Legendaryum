import express, { Express } from "express";
import socket from "socket.io";
import router from "./routes/index";
import http, { Server } from "http";
import redis, { RedisClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { Usuario, Metaverso, Moneda, Room } from "./types/types";

const app: Express = express();
const server: Server = http.createServer(app);
const port: number = 3000;
const secret = { host: "localhost", port: 3000, password: "" };
const client: RedisClient = redis.createClient(secret);

app.use(express.json());

// app.use("/api", router);

server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

export const io: socket.Server = socket(server);

io.on("connection", (socket) => {

  socket.on("room", (idRoom: string) => {
    client.hget("rooms", idRoom, (err: Error | null, room) => {
      if (err) {
        io.emit("error", err);
      }

      const roomObtenida: Room = JSON.parse(room);
      socket.emit("Monedas", JSON.stringify(roomObtenida.monedas));
    });
  });

  socket.on("agarrarMoneda", () => {

  });

});

export default app;