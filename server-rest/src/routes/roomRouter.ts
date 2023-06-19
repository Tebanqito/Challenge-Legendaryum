import { Router, Request, Response } from "express";
import redis, { RedisClient } from "redis";
import { Room } from "../types/types";
import { v4 as uuidv4 } from "uuid";

const client: RedisClient = redis.createClient();
const roomRouter: Router = Router();

roomRouter.get("/", (req: Request, res: Response) => {
  client.hgetall("rooms", (err: Error | null, rooms) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Error al obtener las rooms." });
    }

    res.status(200).json(JSON.parse(JSON.stringify(rooms)));
  });
});

roomRouter.get("/:id", (req: Request, res: Response) => {
  const id: string = req.params.id;

  client.hget("rooms", id, (err: Error | null, room: string) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: `Error al obtener la room con el id ${id}.` });
    }

    res.status(200).json(JSON.parse(room));
  });
});

export default roomRouter;