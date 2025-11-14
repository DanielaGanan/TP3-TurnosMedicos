import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// Obtener todos los medicos
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, nombre, apellido, especialidad, matricula_profesional FROM medico ORDER BY apellido, nombre"
    );

    res.json({
      success: true,
      medicos: rows,
    });
  } catch (error) {
    console.error("Error al obtener médicos:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener médicos",
    });
  }
});

// Obtener un medico por id
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute(
        "SELECT id, nombre, apellido, especialidad, matricula_profesional FROM medico WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Médico no encontrado",
        });
      }

      res.json({
        success: true,
        medico: rows[0],
      });
    } catch (error) {
      console.error("Error al obtener médico:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener médico",
      });
    }
  }
);

// Crear un nuevo medico
router.post(
  "/",
  verificarAutenticacion,
  body("nombre").notEmpty().isLength({ max: 100 }),
  body("apellido").notEmpty().isLength({ max: 100 }),
  body("especialidad").notEmpty().isLength({ max: 100 }),
  body("matricula_profesional").notEmpty().isLength({ max: 50 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, apellido, especialidad, matricula_profesional } =
        req.body;

      // Verificar si la matrícula ya existe
      const [existente] = await db.execute(
        "SELECT id FROM medico WHERE matricula_profesional = ?",
        [matricula_profesional]
      );

      if (existente.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Ya existe un médico con esa matrícula profesional",
        });
      }

      const [result] = await db.execute(
        "INSERT INTO medico (nombre, apellido, especialidad, matricula_profesional) VALUES (?, ?, ?, ?)",
        [nombre, apellido, especialidad, matricula_profesional]
      );

      res.status(201).json({
        success: true,
        message: "Médico creado exitosamente",
        medico: {
          id: result.insertId,
          nombre,
          apellido,
          especialidad,
          matricula_profesional,
        },
      });
    } catch (error) {
      console.error("Error al crear médico:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear médico",
      });
    }
  }
);

// Actualizar medico
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  body("nombre").notEmpty().isLength({ max: 100 }),
  body("apellido").notEmpty().isLength({ max: 100 }),
  body("especialidad").notEmpty().isLength({ max: 100 }),
  body("matricula_profesional").notEmpty().isLength({ max: 50 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, apellido, especialidad, matricula_profesional } =
        req.body;

      // Verificar si el medico existe
      const [medicoExiste] = await db.execute(
        "SELECT id FROM medico WHERE id = ?",
        [id]
      );

      if (medicoExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Médico no encontrado",
        });
      }

      // Verificar si la matricula ya existe en otro medico
      const [existente] = await db.execute(
        "SELECT id FROM medico WHERE matricula_profesional = ? AND id != ?",
        [matricula_profesional, id]
      );

      if (existente.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Ya existe otro médico con esa matrícula profesional",
        });
      }

      await db.execute(
        "UPDATE medico SET nombre = ?, apellido = ?, especialidad = ?, matricula_profesional = ? WHERE id = ?",
        [nombre, apellido, especialidad, matricula_profesional, id]
      );

      res.json({
        success: true,
        message: "Médico actualizado exitosamente",
        medico: { id, nombre, apellido, especialidad, matricula_profesional },
      });
    } catch (error) {
      console.error("Error al actualizar médico:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar médico",
      });
    }
  }
);

// Eliminar un medico
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      //Verificar si el medico existe
      const [medicoExiste] = await db.execute(
        "SELECT id FROM medico WHERE id = ?",
        [id]
      );

      if (medicoExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Médico no encontrado",
        });
      }

      // Verificar si tiene turnos asociados
      const [turnos] = await db.execute(
        "SELECT COUNT(*) as count FROM turno WHERE medico_id = ?",
        [id]
      );

      if (turnos[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: "No se puede eliminar el médico porque tiene turnos asociados",
        });
      }

      await db.execute("DELETE FROM medico WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Médico eliminado exitosamente",
        id,
      });
    } catch (error) {
      console.error("Error al eliminar médico:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar médico",
      });
    }
  }
);

export default router;
