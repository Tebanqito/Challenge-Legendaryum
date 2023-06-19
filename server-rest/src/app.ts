import express from "express";
import bodyParser from "body-parser";

const port: number = 3001;
const app = express();
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});