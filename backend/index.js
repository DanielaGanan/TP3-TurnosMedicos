import express from "express";
import cors from "cors";
// para leer las variables .env
import dotenv from "dotenv";
import { conectarDB } from "./db.js";

dotenv.config();
conectarDB();


const app = express();
const port = 3000;

// Interpretar body como json
app.use(express.json());

// habilitamos cors
app.use(cors());


app.get("/", (req, res) => {
    res.send("Hola");
})


app.listen(port, () => {
    console.log(`La aplicación esta funcionando en el puerto ${port}`);
})