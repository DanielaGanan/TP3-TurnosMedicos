import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams, Link } from "react-router";

export const ModificarTurno = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const fetchTurno = useCallback(async () => {
    try {
      const response = await fetchAuth(`http://localhost:3000/turnos/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error al consultar turno:", data.error);
        return;
      }

      // Formatear fecha para input date
      const fecha = new Date(data.turno.fecha);
      const fechaFormateada = fecha.toISOString().split("T")[0];

      setValues({
        ...data.turno,
        fecha: fechaFormateada,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [fetchAuth, id]);

  const fetchPacientes = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/pacientes");
      const data = await response.json();
      if (data.success) setPacientes(data.pacientes);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  }, [fetchAuth]);

  const fetchMedicos = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/medicos");
      const data = await response.json();
      if (data.success) setMedicos(data.medicos);
    } catch (error) {
      console.error("Error al obtener médicos:", error);
    }
  }, [fetchAuth]);

  useEffect(() => {
    fetchTurno();
    fetchPacientes();
    fetchMedicos();
  }, [fetchTurno, fetchPacientes, fetchMedicos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    try {
      const response = await fetchAuth(`http://localhost:3000/turnos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errores) {
          return setErrores(data.errores);
        }
        return window.alert(data.error || "Error al modificar turno");
      }

      navigate("/turnos");
    } catch {
      window.alert("Error al modificar turno");
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
      <h2>Modificar Turno</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Paciente *
          <select
            required
            value={values.paciente_id}
            onChange={(e) =>
              setValues({ ...values, paciente_id: e.target.value })
            }
            aria-invalid={!!getError("paciente_id")}
          >
            <option value="">Seleccione un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre} - DNI: {p.DNI}
              </option>
            ))}
          </select>
          {getError("paciente_id") && <small>{getError("paciente_id")}</small>}
        </label>

        <label>
          Médico *
          <select
            required
            value={values.medico_id}
            onChange={(e) =>
              setValues({ ...values, medico_id: e.target.value })
            }
            aria-invalid={!!getError("medico_id")}
          >
            <option value="">Seleccione un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                Dr/a. {m.apellido}, {m.nombre} - {m.especialidad}
              </option>
            ))}
          </select>
          {getError("medico_id") && <small>{getError("medico_id")}</small>}
        </label>

        <div className="grid">
          <label>
            Fecha *
            <input
              required
              type="date"
              value={values.fecha}
              onChange={(e) => setValues({ ...values, fecha: e.target.value })}
              aria-invalid={!!getError("fecha")}
            />
            {getError("fecha") && <small>{getError("fecha")}</small>}
          </label>
          <label>
            Hora *
            <input
              required
              type="time"
              value={values.hora}
              onChange={(e) => setValues({ ...values, hora: e.target.value })}
              aria-invalid={!!getError("hora")}
            />
            {getError("hora") && <small>{getError("hora")}</small>}
          </label>
        </div>

        <label>
          Estado
          <select
            value={values.estado}
            onChange={(e) => setValues({ ...values, estado: e.target.value })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="atendido">Atendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>

        <label>
          Observaciones
          <textarea
            rows="3"
            value={values.observaciones || ""}
            onChange={(e) =>
              setValues({ ...values, observaciones: e.target.value })
            }
            placeholder="Motivo de la consulta, indicaciones especiales, etc."
          />
          {getError("observaciones") && (
            <small>{getError("observaciones")}</small>
          )}
        </label>

        <div className="grid">
          <Link role="button" className="secondary" to="/turnos">
            Cancelar
          </Link>
          <input type="submit" value="Guardar Cambios" />
        </div>
      </form>
    </article>
  );
};
