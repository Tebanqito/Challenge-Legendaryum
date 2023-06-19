import { Router, Request, Response, NextFunction } from "express";
import redis, { RedisClient } from "redis"

const client: RedisClient = redis.createClient();
const roomRouter: Router = Router();



export default roomRouter;