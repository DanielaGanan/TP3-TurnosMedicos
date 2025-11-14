import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
  // Opciones de configuracion de passport-jwt
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Creo estrategia jwt
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      // Si llegamos a este punto es porque el token es valido
      next(null, payload);
    })
  );
}

export const verificarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Ruta de registro
router.post(
  "/register",
  body("nombre").notEmpty().isLength({ max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, email, password } = req.body;

      // Verificar si el email ya existe
      const [existingUsers] = await db.execute(
        "SELECT id FROM usuario WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          error: "El email ya está registrado",
        });
      }

      //crear hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insertar usuario
      const [result] = await db.execute(
        "INSERT INTO usuario (nombre, email, contrasena) VALUES (?, ?, ?)",
        [nombre, email, hashedPassword]
      );

      // Generar token
      const payload = { userId: result.insertId, email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        token,
        user: { id: result.insertId, nombre, email },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({
        success: false,
        error: "Error al registrar usuario",
      });
    }
  }
);

// Ruta de login
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Consultar por el usuario
      const [usuarios] = await db.execute(
        "SELECT * FROM usuario WHERE email = ?",
        [email]
      );

      if (usuarios.length === 0) {
        return res.status(401).json({
          success: false,
          error: "Credenciales inválidas",
        });
      }

      // Verificar la contraseña
      const usuario = usuarios[0];
      const passwordValida = await bcrypt.compare(password, usuario.contrasena);

      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          error: "Credenciales inválidas",
        });
      }

      //generar JWT
      const payload = { userId: usuario.id, email: usuario.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });

      // Devolver token y datos del usuario - sin la contraseña
      res.json({
        success: true,
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        error: "Error al iniciar sesión",
      });
    }
  }
);

export default router;
