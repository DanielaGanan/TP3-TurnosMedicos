import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, query } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// Obtener todos los turnos con filtros opc
router.get(
  "/",
  verificarAutenticacion,
  query("paciente_id").optional().isInt({ min: 1 }),
  query("medico_id").optional().isInt({ min: 1 }),
  query("estado").optional().isIn(["pendiente", "atendido", "cancelado"]),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { paciente_id, medico_id, estado } = req.query;

      let sql = `
        SELECT 
          t.id, 
          t.paciente_id, 
          t.medico_id, 
          t.fecha, 
          t.hora, 
          t.estado, 
          t.observaciones,
          CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
          CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
          m.especialidad
        FROM turno t
        JOIN paciente p ON t.paciente_id = p.id
        JOIN medico m ON t.medico_id = m.id
        WHERE 1=1
      `;

      const params = [];

      if (paciente_id) {
        sql += " AND t.paciente_id = ?";
        params.push(paciente_id);
      }

      if (medico_id) {
        sql += " AND t.medico_id = ?";
        params.push(medico_id);
      }

      if (estado) {
        sql += " AND t.estado = ?";
        params.push(estado);
      }

      sql += " ORDER BY t.fecha DESC, t.hora DESC";

      const [rows] = await db.execute(sql, params);

      res.json({
        success: true,
        turnos: rows,
      });
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener turnos",
      });
    }
  }
);

// Obtener un turno por su id
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute(
        `SELECT 
          t.id, 
          t.paciente_id, 
          t.medico_id, 
          t.fecha, 
          t.hora, 
          t.estado, 
          t.observaciones,
          CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
          p.DNI as paciente_dni,
          CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
          m.especialidad
        FROM turno t
        JOIN paciente p ON t.paciente_id = p.id
        JOIN medico m ON t.medico_id = m.id
        WHERE t.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      res.json({
        success: true,
        turno: rows[0],
      });
    } catch (error) {
      console.error("Error al obtener turno:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener turno",
      });
    }
  }
);

//Crear un nuevo turno
router.post(
  "/",
  verificarAutenticacion,
  body("paciente_id").isInt({ min: 1 }),
  body("medico_id").isInt({ min: 1 }),
  body("fecha").isDate({ format: "YYYY-MM-DD" }),
  body("hora").matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  body("estado")
    .optional()
    .isIn(["pendiente", "atendido", "cancelado"])
    .default("pendiente"),
  body("observaciones").optional().isString(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { paciente_id, medico_id, fecha, hora, estado, observaciones } =
        req.body;

      // Verificar que el paciente existe
      const [paciente] = await db.execute(
        "SELECT id FROM paciente WHERE id = ?",
        [paciente_id]
      );

      if (paciente.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Paciente no encontrado",
        });
      }

      // Verificar que el medico existe
      const [medico] = await db.execute("SELECT id FROM medico WHERE id = ?", [
        medico_id,
      ]);

      if (medico.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Médico no encontrado",
        });
      }

      //verificar que no haya otro turno en el mismo horario para el mismo medico
      const [turnoExistente] = await db.execute(
        "SELECT id FROM turno WHERE medico_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelado'",
        [medico_id, fecha, hora]
      );

      if (turnoExistente.length > 0) {
        return res.status(400).json({
          success: false,
          error: "El médico ya tiene un turno asignado en ese horario",
        });
      }

      const [result] = await db.execute(
        "INSERT INTO turno (paciente_id, medico_id, fecha, hora, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?)",
        [
          paciente_id,
          medico_id,
          fecha,
          hora,
          estado || "pendiente",
          observaciones || null,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Turno creado exitosamente",
        turno: {
          id: result.insertId,
          paciente_id,
          medico_id,
          fecha,
          hora,
          estado: estado || "pendiente",
          observaciones,
        },
      });
    } catch (error) {
      console.error("Error al crear turno:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear turno",
      });
    }
  }
);

// Actualizar un turno
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  body("paciente_id").optional().isInt({ min: 1 }),
  body("medico_id").optional().isInt({ min: 1 }),
  body("fecha").optional().isDate({ format: "YYYY-MM-DD" }),
  body("hora")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  body("estado").optional().isIn(["pendiente", "atendido", "cancelado"]),
  body("observaciones").optional().isString(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Verificar si el turno existe
      const [turnoExiste] = await db.execute(
        "SELECT * FROM turno WHERE id = ?",
        [id]
      );

      if (turnoExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      const turnoActual = turnoExiste[0];
      const {
        paciente_id = turnoActual.paciente_id,
        medico_id = turnoActual.medico_id,
        fecha = turnoActual.fecha,
        hora = turnoActual.hora,
        estado = turnoActual.estado,
        observaciones = turnoActual.observaciones,
      } = req.body;

      //Si se cambia medico, fecha u hora, verificar disponibilidad
      if (
        medico_id !== turnoActual.medico_id ||
        fecha !== turnoActual.fecha ||
        hora !== turnoActual.hora
      ) {
        const [conflicto] = await db.execute(
          "SELECT id FROM turno WHERE medico_id = ? AND fecha = ? AND hora = ? AND id != ? AND estado != 'cancelado'",
          [medico_id, fecha, hora, id]
        );

        if (conflicto.length > 0) {
          return res.status(400).json({
            success: false,
            error: "El medico ya tiene un turno asignado en ese horario",
          });
        }
      }

      await db.execute(
        "UPDATE turno SET paciente_id = ?, medico_id = ?, fecha = ?, hora = ?, estado = ?, observaciones = ? WHERE id = ?",
        [paciente_id, medico_id, fecha, hora, estado, observaciones, id]
      );

      res.json({
        success: true,
        message: "Turno actualizado exitosamente",
        turno: {
          id,
          paciente_id,
          medico_id,
          fecha,
          hora,
          estado,
          observaciones,
        },
      });
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar turno",
      });
    }
  }
);

// Actualizar solo el estado y observaciones de un turno
router.patch(
  "/:id/estado",
  verificarAutenticacion,
  validarId,
  body("estado").isIn(["pendiente", "atendido", "cancelado"]),
  body("observaciones").optional().isString(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado, observaciones } = req.body;

      // Verificar si el turno existe
      const [turnoExiste] = await db.execute(
        "SELECT id FROM turno WHERE id = ?",
        [id]
      );

      if (turnoExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      await db.execute(
        "UPDATE turno SET estado = ?, observaciones = ? WHERE id = ?",
        [estado, observaciones || null, id]
      );

      res.json({
        success: true,
        message: "Estado del turno actualizado exitosamente",
        turno: { id, estado, observaciones },
      });
    } catch (error) {
      console.error("Error al actualizar estado del turno:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar estado del turno",
      });
    }
  }
);

// Eliminar un turno
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Verificar si el turno existe
      const [turnoExiste] = await db.execute(
        "SELECT id FROM turno WHERE id = ?",
        [id]
      );

      if (turnoExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      await db.execute("DELETE FROM turno WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Turno eliminado exitosamente",
        id,
      });
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar turno",
      });
    }
  }
);

export default router;
