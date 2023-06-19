import { Router, Request, Response } from "express";
import redis, { RedisClient } from "redis";
import { Room, Moneda, LimitePoscion, Usuario } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import { Console } from "console";

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

roomRouter.post("/", (req: Request, res: Response) => {
  const usuarios: Usuario[] = req.body.usuarios;
  const limitesPosicion: LimitePoscion = req.body.limitePosicion;
  const monedas: Moneda[] = req.body.monedas;
  const nombreRoom: string = req.body.nombreRoom;
  const cantidadMonedas: number = req.body.cantidadMonedas;
  const id: string = uuidv4();

  const room: Room = {
    id,
    room: nombreRoom,
    monedas,
    limitesPosicion,
    usuarios,
    cantidadMonedas,
  };

  client.hset("rooms", JSON.stringify(room), (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Error al crear la room." });
    }

    res.status(200).json(room);
  });
});

roomRouter.put("/update/:id", (req: Request, res: Response) => {
  const id: string = req.params.id;
  const attributes: Partial<Room> = req.body.attributes;

  client.hget("rooms", id, (err: Error | null, room: string) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: `Error al obtener la room con id ${id} para actualizar.`,
      });
    }

    let roomToUpdate = JSON.parse(room);
    roomToUpdate = { ...attributes };

    client.hset(
      "rooms",
      id,
      JSON.stringify(roomToUpdate),
      (err: Error | null) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ error: `Error al actualizar la room con id ${id}.` });
        }

        res.status(200).json(roomToUpdate);
      }
    );
  });
});

roomRouter.delete("/delete/:id", (req: Request, res: Response) => {
  const id: string = req.params.id;

  client.hget("rooms", id, (err: Error | null, room: string) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: `Error al obtener la room con id ${id} para eliminar.`,
      });
    }

    let roomToDelete = JSON.parse(room);

    client.hdel("rooms", roomToDelete.id, (err, resultado) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: `Error al eliminar la room con id ${id}.`,
        });
      }

      if (!resultado) return res.status(400).json({ error: `Room con id ${id} no eliminada.` });

      res.status(200).json(roomToDelete);
    });
  });
});

export default roomRouter;
