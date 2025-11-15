import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router";

export const CrearMedico = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);
  const [values, setValues] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    matricula_profesional: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    try {
      const response = await fetchAuth("http://localhost:3000/medicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errores) {
          return setErrores(data.errores);
        }
        return window.alert(data.error || "Error al crear médico");
      }

      navigate("/medicos");
    } catch {
      window.alert("Error al crear médico");
    }
  };

  const getError = (field) => {
    if (!errores) return null;
    return errores.find((e) => e.path === field)?.msg || null;
  };

  return (
    <article>
      <h2>Crear Médico</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            Nombre *
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
              aria-invalid={!!getError("nombre")}
            />
            {getError("nombre") && <small>{getError("nombre")}</small>}
          </label>
          <label>
            Apellido *
            <input
              required
              value={values.apellido}
              onChange={(e) =>
                setValues({ ...values, apellido: e.target.value })
              }
              aria-invalid={!!getError("apellido")}
            />
            {getError("apellido") && <small>{getError("apellido")}</small>}
          </label>
        </div>

        <div className="grid">
          <label>
            Especialidad *
            <input
              required
              value={values.especialidad}
              onChange={(e) =>
                setValues({ ...values, especialidad: e.target.value })
              }
              placeholder="Ej: Cardiología, Traumatología"
              aria-invalid={!!getError("especialidad")}
            />
            {getError("especialidad") && (
              <small>{getError("especialidad")}</small>
            )}
          </label>
          <label>
            Matrícula Profesional *
            <input
              required
              value={values.matricula_profesional}
              onChange={(e) =>
                setValues({ ...values, matricula_profesional: e.target.value })
              }
              placeholder="Ej: MP12345"
              aria-invalid={!!getError("matricula_profesional")}
            />
            {getError("matricula_profesional") && (
              <small>{getError("matricula_profesional")}</small>
            )}
          </label>
        </div>

        <div className="grid">
          <Link role="button" className="secondary" to="/medicos">
            Cancelar
          </Link>
          <input type="submit" value="Crear Médico" />
        </div>
      </form>
    </article>
  );
};