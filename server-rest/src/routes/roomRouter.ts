import { Router, Request, Response } from "express";
import redis, { RedisClient } from "redis";
import { Room } from "../types/types";

const client: RedisClient = redis.createClient();
const roomRouter: Router = Router();

roomRouter.get("/", (req: Request, res: Response) => {
  client.hgetall("rooms", (err: Error | null, rooms) => {
    if (err) return res.status(400).json({ error: err });

    res.status(200).json(rooms);
  });
});

export default roomRouter;
