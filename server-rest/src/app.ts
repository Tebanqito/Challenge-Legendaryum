import express, { Express } from "express";
import bodyParser from "body-parser";

const port: number = 3001;
const app: Express = express();
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});