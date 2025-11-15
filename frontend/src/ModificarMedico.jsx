import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams, Link } from "react-router";

export const ModificarMedico = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);

  const fetchMedico = useCallback(async () => {
    try {
      const response = await fetchAuth(`http://localhost:3000/medicos/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error al consultar médico:", data.error);
        return;
      }

      setValues(data.medico);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchMedico();
  }, [fetchMedico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    try {
      const response = await fetchAuth(`http://localhost:3000/medicos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errores) {
          return setErrores(data.errores);
        }
        return window.alert(data.error || "Error al modificar médico");
      }

      navigate("/medicos");
    } catch {
      window.alert("Error al modificar médico");
    }
  };

  const getError = (field) => {
    if (!errores) return null;
    const error = errores.find((e) => e.path === field);
    return error ? error.msg : null;
  };

  if (!values) {
    return <p aria-busy="true">Cargando...</p>;
  }

  return (
    <article>
      <h2>Modificar Médico</h2>
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
          <input type="submit" value="Guardar Cambios" />
        </div>
      </form>
    </article>
  );
};
