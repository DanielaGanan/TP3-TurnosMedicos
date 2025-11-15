import { useState } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router";

export const Ingresar = () => {
  const { error, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      setOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Ingresar</button>
      <dialog open={open}>
        <article>
          <header>
            <button
              aria-label="Close"
              className="close"
              onClick={() => setOpen(false)}
            ></button>
            <h2>Iniciar Sesión</h2>
          </header>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label htmlFor="email">
                Email:
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </label>
              <label htmlFor="password">
                Contraseña:
                <input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </fieldset>
            <footer>
              <div className="grid">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit">Ingresar</button>
              </div>
              <p style={{ textAlign: "center", marginTop: "1rem" }}>
                ¿No tenés cuenta? <Link to="/registro">Registrate aquí</Link>
              </p>
            </footer>
          </form>
        </article>
      </dialog>
    </>
  );
};
