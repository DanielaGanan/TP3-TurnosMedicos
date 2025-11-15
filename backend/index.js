import express from "express";
import cors from "cors";
// para leer las variables .env
import dotenv from "dotenv";
import { conectarDB } from "./db.js";
import authRouter from "./auth.js"; 
import pacientesRouter from "./pacientes.js";
import medicosRouter from "./medicos.js";
import turnosRouter from "./turnos.js";
import { authConfig } from "./auth.js";

dotenv.config();
conectarDB();


const app = express();
const port = 3000;

// Interpretar body como json
app.use(express.json());

// habilitamos cors
app.use(cors());

authConfig();


app.get("/", (req, res) => {
    res.send("Gestión de Turnos Médicos");
})

app.use("/auth", authRouter);
app.use("/pacientes", pacientesRouter);
app.use("/medicos", medicosRouter);
app.use("/turnos", turnosRouter);


// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Ruta no encontrada",
    });
});


// Manejo de errores global
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        error: "Error interno del servidor",
    });
});



app.listen(port, () => {
    console.log(`La aplicación esta funcionando en el puerto ${port}`);
})