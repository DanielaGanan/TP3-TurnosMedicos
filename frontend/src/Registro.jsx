import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router";

export const Registro = () => {
  const { error, register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(nombre, email, password);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <article>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre completo:
            <input
              required
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
            />
          </label>
          <label>
            Email:
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </label>
          <label>
            Contraseña:
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres, 1 número"
            />
            <small>Debe tener al menos 8 caracteres y un número</small>
          </label>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </fieldset>
        <div className="grid">
          <Link role="button" className="secondary" to="/">
            Cancelar
          </Link>
          <input type="submit" value="Registrarse" />
        </div>
      </form>
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        ¿Ya tenés cuenta? <Link to="/">Ingresá aquí</Link>
      </p>
    </article>
  );
};
