import express, { Request, Response, Router } from "express";
import redis, { RedisClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { io } from "../app";
import { Usuario, Metaverso, Moneda, Room } from "../types/types";

const secret = { host: "", port: 3000, password: "" };

const userRouter: Router = Router();
const client: RedisClient = redis.createClient(secret);

io.on("connection", (socket) => {
  console.log("Usuario conectado");
});

userRouter.get("/users", async (req: Request, res: Response) => {
  client.hgetall("users", (err: Error | null, users) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }
    return res.json(users);
  });
});

export default userRouter;