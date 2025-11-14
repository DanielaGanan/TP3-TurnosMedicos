import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

//Obtener todos los pacientes
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, nombre, apellido, DNI, fecha_nacimiento, obra_social FROM paciente ORDER BY apellido, nombre"
    );

    res.json({
      success: true,
      pacientes: rows,
    });
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener pacientes",
    });
  }
});

// Obtener un paciente por su id
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute(
        "SELECT id, nombre, apellido, DNI, fecha_nacimiento, obra_social FROM paciente WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      res.json({
        success: true,
        paciente: rows[0],
      });
    } catch (error) {
      console.error("Error al obtener paciente:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener paciente",
      });
    }
  }
);

// Crear un nuevo paciente
router.post(
  "/",
  verificarAutenticacion,
  body("nombre").notEmpty().isLength({ max: 100 }),
  body("apellido").notEmpty().isLength({ max: 100 }),
  body("DNI").notEmpty().isLength({ max: 20 }),
  body("fecha_nacimiento").isDate({ format: "YYYY-MM-DD" }),
  body("obra_social").optional().isLength({ max: 100 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, apellido, DNI, fecha_nacimiento, obra_social } = req.body;

      // Verificar si el DNI ya existe
      const [existente] = await db.execute(
        "SELECT id FROM paciente WHERE DNI = ?",
        [DNI]
      );

      if (existente.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Ya existe un paciente con ese DNI",
        });
      }

      const [result] = await db.execute(
        "INSERT INTO paciente (nombre, apellido, DNI, fecha_nacimiento, obra_social) VALUES (?, ?, ?, ?, ?)",
        [nombre, apellido, DNI, fecha_nacimiento, obra_social || null]
      );

      res.status(201).json({
        success: true,
        message: "Paciente creado exitosamente",
        paciente: {
          id: result.insertId,
          nombre,
          apellido,
          DNI,
          fecha_nacimiento,
          obra_social,
        },
      });
    } catch (error) {
      console.error("Error al crear paciente:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear paciente",
      });
    }
  }
);

// Actualizar un paciente
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  body("nombre").notEmpty().isLength({ max: 100 }),
  body("apellido").notEmpty().isLength({ max: 100 }),
  body("DNI").notEmpty().isLength({ max: 20 }),
  body("fecha_nacimiento").isDate({ format: "YYYY-MM-DD" }),
  body("obra_social").optional().isLength({ max: 100 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, apellido, DNI, fecha_nacimiento, obra_social } = req.body;

      //Verificar si el paciente existe
      const [pacienteExiste] = await db.execute(
        "SELECT id FROM paciente WHERE id = ?",
        [id]
      );

      if (pacienteExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      //verificar si el dni ya existe en otro paciente
      const [existente] = await db.execute(
        "SELECT id FROM paciente WHERE DNI = ? AND id != ?",
        [DNI, id]
      );

      if (existente.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Ya existe otro paciente con ese DNI",
        });
      }

      await db.execute(
        "UPDATE paciente SET nombre = ?, apellido = ?, DNI = ?, fecha_nacimiento = ?, obra_social = ? WHERE id = ?",
        [nombre, apellido, DNI, fecha_nacimiento, obra_social || null, id]
      );

      res.json({
        success: true,
        message: "Paciente actualizado exitosamente",
        paciente: { id, nombre, apellido, DNI, fecha_nacimiento, obra_social },
      });
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar paciente",
      });
    }
  }
);

// Eliminar un paciente
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Verificar si el paciente existe
      const [pacienteExiste] = await db.execute(
        "SELECT id FROM paciente WHERE id = ?",
        [id]
      );

      if (pacienteExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      // Verificar si tiene turnos asociados
      const [turnos] = await db.execute(
        "SELECT COUNT(*) as count FROM turno WHERE paciente_id = ?",
        [id]
      );

      if (turnos[0].count > 0) {
        return res.status(400).json({
          success: false,
          error:
            "No se puede eliminar el paciente porque tiene turnos asociados",
        });
      }

      await db.execute("DELETE FROM paciente WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Paciente eliminado exitosamente",
        id,
      });
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar paciente",
      });
    }
  }
);

export default router;
