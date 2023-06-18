import express from "express";
import { Server } from "socket.io";

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

const app = express();
const port = 3000;

app.use(express.json());

const server = app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

export default app;