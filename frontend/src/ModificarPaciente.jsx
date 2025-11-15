import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams, Link } from "react-router";

export const ModificarPaciente = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);

  const fetchPaciente = useCallback(async () => {
    try {
      const response = await fetchAuth(`http://localhost:3000/pacientes/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error al consultar paciente:", data.error);
        return;
      }

      // Formatear fecha para input date
      const fecha = new Date(data.paciente.fecha_nacimiento);
      const fechaFormateada = fecha.toISOString().split("T")[0];

      setValues({
        ...data.paciente,
        fecha_nacimiento: fechaFormateada,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchPaciente();
  }, [fetchPaciente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    try {
      const response = await fetchAuth(
        `http://localhost:3000/pacientes/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errores) {
          return setErrores(data.errores);
        }
        return window.alert(data.error || "Error al modificar paciente");
      }

      navigate("/pacientes");
    } catch {
      window.alert("Error al modificar paciente");
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
      <h2>Modificar Paciente</h2>
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
            value={values.obra_social || ""}
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
          <input type="submit" value="Guardar Cambios" />
        </div>
      </form>
    </article>
  );
};