import express, { Express } from "express";
import { Server } from "socket.io";
import router from "./routes/index";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
};

interface ClientToServerEvents {
  hello: () => void;
};

interface InterServerEvents {
  ping: () => void;
};

interface SocketData {
  name: string;
  age: number;
};

const app: Express = express();
const port: number = 3000;

app.use(express.json());

app.use("/api", router);

const server = app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

export const io: Server = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

export default app;