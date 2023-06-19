import express, { Express } from "express";
import socket from "socket.io";
import router from "./routes/index";
import http, { Server } from "http";
import redis, { RedisClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { Usuario, Metaverso, Moneda, Room, TipoMoneda } from "./types/types";
import { forEachChild } from "typescript";

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
    client.hget("rooms", idRoom, (err: Error | null, roomData: string) => {
      if (err) return io.emit("error", err);

      const room: Room = JSON.parse(roomData);
      socket.emit("Monedas", JSON.stringify(room.monedas));
    });
  });

  socket.on(
    "agarrarMoneda",
    (data: { idUsuario: string; idRoom: string; idMoneda: string }) => {
      client.hget(
        "users",
        data.idUsuario,
        (err: Error | null, userData: string) => {
          if (err) return io.emit("error", err);

          const user: Usuario = JSON.parse(userData);

          client.hget(
            "rooms",
            data.idRoom,
            (err: Error | null, roomData: string) => {
              if (err) return io.emit("error", err);

              const room: Room = JSON.parse(roomData);

              let moneda: Moneda;
              let tipoMoneda: TipoMoneda = "Dolar";
              for (let index = 0; index < room.monedas.length; index++) {
                if (room.monedas[index].id === data.idMoneda) {
                  moneda = room.monedas[index];
                  tipoMoneda = moneda.tipoMoneda;
                  room.monedas.filter((m) => m.id !== moneda.id);
                  user.monedas = [...user.monedas, moneda];
                  break;
                }
              }

              client.hset(
                "users",
                data.idUsuario,
                JSON.stringify(user),
                (err: Error | null) => {
                  if (err) return io.emit("error", err);
                }
              );

              client.hset(
                "rooms",
                data.idRoom,
                JSON.stringify(room),
                (err: Error | null) => {
                  if (err) return io.emit("error", err);
                }
              );

              const isTipoMoneda: boolean = room.monedas
                .map((m) => m.tipoMoneda)
                .includes(tipoMoneda);

              if (!isTipoMoneda)
                io.emit(
                  `La moneda ${tipoMoneda} ya no esta disponible en la room ${room.room}`
                );
            }
          );
        }
      );
    }
  );


});

export default app;
