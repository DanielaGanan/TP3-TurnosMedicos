import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router";

export const CrearPaciente = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);
  const [values, setValues] = useState({
    nombre: "",
    apellido: "",
    DNI: "",
    fecha_nacimiento: "",
    obra_social: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    try {
      const response = await fetchAuth("http://localhost:3000/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errores) {
          return setErrores(data.errores);
        }
        return window.alert(data.error || "Error al crear paciente");
      }

      navigate("/pacientes");
    } catch {
      window.alert("Error al crear paciente");
    }
  };

  const getError = (field) => {
    if (!errores) return null;
    const error = errores.find((e) => e.path === field);
    return error ? error.msg : null;
  };

  return (
    <article>
      <h2>Crear Paciente</h2>
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
            DNI *
            <input
              required
              value={values.DNI}
              onChange={(e) => setValues({ ...values, DNI: e.target.value })}
              aria-invalid={!!getError("DNI")}
            />
            {getError("DNI") && <small>{getError("DNI")}</small>}
          </label>
          <label>
            Fecha de Nacimiento *
            <input
              required
              type="date"
              value={values.fecha_nacimiento}
              onChange={(e) =>
                setValues({ ...values, fecha_nacimiento: e.target.value })
              }
              aria-invalid={!!getError("fecha_nacimiento")}
            />
            {getError("fecha_nacimiento") && (
              <small>{getError("fecha_nacimiento")}</small>
            )}
          </label>
        </div>

        <label>
          Obra Social
          <input
            value={values.obra_social}
            onChange={(e) =>
              setValues({ ...values, obra_social: e.target.value })
            }
            aria-invalid={!!getError("obra_social")}
          />
          {getError("obra_social") && <small>{getError("obra_social")}</small>}
        </label>

        <div className="grid">
          <Link role="button" className="secondary" to="/pacientes">
            Cancelar
          </Link>
          <input type="submit" value="Crear Paciente" />
        </div>
      </form>
    </article>
  );
};
