import express, { Request, Response, Router } from 'express';
import redis from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../app';

const userRouter = Router();


export default userRouter;