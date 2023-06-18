import express, { Express } from "express";
import socket from "socket.io";
import router from "./routes/index";
import http, { Server } from "http";

const app: Express = express();
const server: Server = http.createServer(app);
const port: number = 3000;

app.use(express.json());

app.use("/api", router);

server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

export const io: socket.Server = socket(server);

export default app;