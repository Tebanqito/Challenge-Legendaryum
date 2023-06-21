import express, { Express } from "express";
import socket from "socket.io";
import http, { Server } from "http";
import redis, { RedisClient } from "redis";
import { generarPosicion3D, corroborarPosicion3D } from "./funciones";
import { v4 as uuidv4 } from "uuid";
import { Usuario, LimitePoscion, Moneda, Room, TipoMoneda, PosicionMoneda } from "./types/types";

const app: Express = express();
const server: Server = http.createServer(app);
const port: number = 3000;
// const secret = { host: "localhost", port: 3000, password: "" };
// const client: RedisClient = redis.createClient(secret);
const client: RedisClient = redis.createClient();

app.use(express.json());

server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

export const io: socket.Server = socket(server);

io.on("connection", (socket) => {

  // USUARIO INDICA EL ESPACIO DEL METAVERSO EN QUE ESTA -----------------------------------------------
  socket.on("room", (idRoom: string) => {
    client.hget("rooms", idRoom, (err: Error | null, roomData: string) => {
      if (err) return io.emit("error", err);

      const room: Room = JSON.parse(roomData); // obtengo la room en la que esta el usuario
      socket.emit("Monedas", JSON.stringify(room.monedas)); // devuelvo las monedas de esa room en un JSON
    });
  });

  // USUARIO AGARRA UNA MONEDA -------------------------------------------------------------------------
  // socket.on(
  //   "agarrarMoneda",
  //   (data: { idUsuario: string; idRoom: string; idMoneda: string }) => {
  //     client.hget(
  //       "users",
  //       data.idUsuario,
  //       (err: Error | null, userData: string) => {
  //         if (err) return io.emit("error", err);

  //         const user: Usuario = JSON.parse(userData); // obtengo el usuario

  //         client.hget(
  //           "rooms",
  //           data.idRoom,
  //           (err: Error | null, roomData: string) => {
  //             if (err) return io.emit("error", err);

  //             const room: Room = JSON.parse(roomData); // obtengo la room

  //             let moneda: Moneda;
  //             let tipoMoneda: TipoMoneda = "Dolar";
  //             // recorro las monedas de la room para ver que moneda agarro el usuario
  //             for (let index = 0; index < room.monedas.length; index++) {
  //               if (room.monedas[index].id === data.idMoneda) {
  //                 moneda = room.monedas[index];
  //                 tipoMoneda = moneda.tipoMoneda;
  //                 // saco de la room la moneda que agarro el usuario
  //                 room.monedas.filter((m) => m.id !== moneda.id);
  //                 user.monedas = [...user.monedas, moneda] as Moneda[]; // agrego la moneda al usuario
  //                 break;
  //               }
  //             }

  //             // actualizo el usuario con la nueva moneda que agarro
  //             client.hset(
  //               "users",
  //               data.idUsuario,
  //               JSON.stringify(user),
  //               (err: Error | null) => {
  //                 if (err) return io.emit("error", err);
  //               }
  //             );

  //             // actualizo la room ya sin la moneda que agarro el usuario
  //             client.hset(
  //               "rooms",
  //               data.idRoom,
  //               JSON.stringify(room),
  //               (err: Error | null) => {
  //                 if (err) return io.emit("error", err);
  //               }
  //             );

  //             // corroboro que el tipo de moneda que agarro el usuario siga en la room
  //             const isTipoMoneda: boolean = room.monedas
  //               .map((m) => m.tipoMoneda)
  //               .includes(tipoMoneda);

  //             // si ya no hay mas monedas de ese tipo en la room, entonces les aviso a todos los usuarios
  //             if (!isTipoMoneda)
  //               io.emit(
  //                 "monedaNoDisponible",
  //                 JSON.stringify({
  //                   message: `La moneda ${tipoMoneda} ya no esta disponible en la room ${room.room}`,
  //                 })
  //               );
  //           }
  //         );
  //       }
  //     );
  //     socket.emit("monedaObtenida", JSON.stringify({ message: "Mondea obtenida." }));
  //   }
  // );
  
  // CONTEMPLANDO EL CASO DE QUE DOS USAURIOS HAGAN UNA PETICION SOBRE UNA MISMA MONEDA AL MISMO TIEMPO 
  // Y CONTEMPLANDO EL CASO DE QUE LA OPERACIONES DEL CLIENTE SON ASINCRONCAS --------------
  // como las operaciones del cliente de redis son asincronicas entonces defino la funcion del segundo
  // parametro con ASYNC para luego poder encargarme las operaciones del cliente con el AWAIT
  socket.on(
    "agarrarMoneda",
    async (data: { idUsuario: string; idRoom: string; idMoneda: string }) => {
      try {
        // trato de obtener la moneda y la operacion del cliente al tratar de obtener la moneda
        // me retornara un valor false o true dependiendo si la moneda esta disponible o no
        const isMoneda: boolean = await client.hget("monedas", data.idMoneda);

        // si isMoneda es igual a false, entonces significa que la moneda no esta disponible,
        // por lo tanto le aviso al usuario y me ahorro el proceso de obtener la room y el usuario
        // antes que la moneda, ya que sin la moneda disponible seria en vano obtener el usuario y la room
        if (!isMoneda) {
          socket.emit("monedaNoDisponible", JSON.stringify({
            message: "La moneda que intenta obtener ya no se encuentra disponible."
          }));
          throw new Error("Moneda no disponible.");
        }

        // si isMoneda es igual true entonces significa que la moneda si esta disponible y puedo seguir
        // con el sistema de que el usuario obtenga esa moneda

        await client.hget(
          "users",
          data.idUsuario,
          async (err: Error | null, userData: string) => {
            if (err) return io.emit("error", err);

            const user: Usuario = JSON.parse(userData); // obtengo el usuario

            await client.hget(
              "rooms",
              data.idRoom,
              async (err: Error | null, roomData: string) => {
                if (err) return io.emit("error", err);

                const room: Room = JSON.parse(roomData); // obtengo la room

                let moneda: Moneda;
                let tipoMoneda: TipoMoneda = "Dolar";
                // recorro las monedas de la room para ver que moneda agarro el usuario
                for (let index = 0; index < room.monedas.length; index++) {
                  if (room.monedas[index].id === data.idMoneda) {
                    moneda = room.monedas[index];
                    tipoMoneda = moneda.tipoMoneda;
                    // saco de la room la moneda que agarro el usuario
                    room.monedas.filter((m) => m.id !== moneda.id);
                    user.monedas = [...user.monedas, moneda] as Moneda[]; // agrego la moneda al usuario
                    break;
                  }
                }

                // actualizo el usuario con la nueva moneda que agarro
                await client.hset(
                  "users",
                  data.idUsuario,
                  JSON.stringify(user),
                  (err: Error | null) => {
                    if (err) return io.emit("error", err);
                  }
                );

                // actualizo la room ya sin la moneda que agarro el usuario
                await client.hset(
                  "rooms",
                  data.idRoom,
                  JSON.stringify(room),
                  (err: Error | null) => {
                    if (err) return io.emit("error", err);
                  }
                );

                // corroboro que el tipo de moneda que agarro el usuario siga en la room
                const isTipoMoneda: boolean = room.monedas
                  .map((m) => m.tipoMoneda)
                  .includes(tipoMoneda);

                // si ya no hay mas monedas de ese tipo en la room, entonces les aviso a todos los usuarios
                if (!isTipoMoneda)
                  io.emit(
                    "monedaNoDisponible",
                    JSON.stringify({
                      message: `La moneda ${tipoMoneda} ya no esta disponible en la room ${room.room}`,
                    })
                  );
              }
            );
          }
        );
        socket.emit("monedaObtenida", JSON.stringify({ message: "Mondea obtenida." }));
      } catch(error) {
        console.error(error);
      }
    }
  );

  // SEÑAL PARA GENERAR MONEDAS ----------------------------------------------------------------------
  socket.on("generarMonedas", (data: string) => {
    // obtengo los datos para generar las monedas
    const configuracion: { 
      idRooms: string[]; 
      cantidadMonedas: number;
      limites3D: LimitePoscion;
    } = JSON.parse(data);

    // por cada room le genero monedas
    for (let index = 0; index < configuracion.idRooms.length; index++) {
      client.hget("rooms", configuracion.idRooms[index], (err: Error | null, data: string) => {
        if (err) return io.emit("error", err);

        let room: Room = JSON.parse(data); // obtengo la room
        room.limitesPosicion = configuracion.limites3D;
        room.cantidadMonedas = configuracion.cantidadMonedas;
        // por cada cantidad de monedas genero una
        for (let index = 0; index < configuracion.cantidadMonedas; index++) {
          client.hgetall("monedas", (err: Error | null, data) => {
            if (err) return io.emit("error", err);

            const monedas: Moneda[] = JSON.parse(JSON.stringify(data)); // obtengo las monedas
            let posicionMoneda: PosicionMoneda = generarPosicion3D(configuracion.limites3D);
            // mientras la posicion que se creo este ocupada genero otra posicion
            while(!corroborarPosicion3D(monedas, posicionMoneda)) {
              posicionMoneda = generarPosicion3D(configuracion.limites3D);
            }
            // creo la moneda
            const moneda: Moneda = {
              id: uuidv4(),
              tipoMoneda: "Dolar",
              posicion: posicionMoneda
            };
            // seteo la moneda en la BDD con la expiracion de que en 1 hora se borre
            client.set("monedas", JSON.stringify(moneda), "EX", 3600, (err: Error | null) => {
              if (err) return io.emit("error", err);
            });

            // le agrego la moneda a la room
            room.monedas = [...room.monedas, moneda];
            // actualizo la room con la moneda nueva
            client.hset("rooms", room.id, JSON.stringify(room), (err: Error | null) => {
              if (err) return io.emit("error", err);
            });
          });
        }

      });
    }

    // obtengo todas las rooms ya con sus monedas y las devuelvo en un JSON
    client.hgetall("rooms", (err: Error | null, data) => {
      if (err) return io.emit("error", err);
      socket.emit("Rooms", JSON.stringify(data));
    });
  });

  // GENERACION AUTOMATICA DE MONEDAS CON ROOMS YA SETEADAS EN LA BDD -------------------------------------
  socket.on("generacionMonedasAutomatico", () => {
    // busco las rooms desde la BDD
    client.hgetall("rooms", (err: Error | null, data) => {
      if (err) return io.emit("error", err);
    
      let rooms: Room[] = JSON.parse(JSON.stringify(data)); // obtengo las rooms

      // recorro cada room para agregarle nuevas monedas con su configuracion de limites y cantidad
      // de monedas ya preestablecidas
      for (let i = 0; i < rooms.length; i++) {
        // por cada cantidad de monedas agrego una a la room
        for (let j = 0; j < rooms[i].cantidadMonedas; j++) {
          let posicionMoneda: PosicionMoneda = generarPosicion3D(rooms[i].limitesPosicion);
 
          // creo la moneda
          const moneda: Moneda = {
            id: uuidv4(),
            tipoMoneda: "Dolar",
            posicion: posicionMoneda
          };

          // agrego la nueva moneda a la room
          rooms[i].monedas = [ ...rooms[i].monedas, moneda ] as Moneda[];
          
          // seteo la nueva moneda a la BDD
          client.set("monedas", JSON.stringify(moneda), "EX", 3600, (err: Error | null) => {
            if (err) return io.emit("error", err);
          });

          // actualizo la room con la moneda nueva
          client.hset("rooms", rooms[i].id, JSON.stringify(rooms[i]), (err: Error | null) => {
            if (err) return io.emit("error", err);
          });
        }

      }

      // obtengo todas las rooms ya con sus monedas y las devuelvo en un JSON
      client.hgetall("rooms", (err: Error | null, data) => {
        if (err) return io.emit("error", err);
        socket.emit("Rooms", JSON.stringify(data));
      });
    });
  });

});

export default app;