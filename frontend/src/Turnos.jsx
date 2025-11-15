import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router";

export function Turnos() {
  const { fetchAuth } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: "",
    buscar: "",
  });

  const fetchTurnos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append("estado", filtros.estado);

      const url = `http://localhost:3000/turnos${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetchAuth(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error:", data.error);
        return;
      }

      setTurnos(data.turnos);
    } catch (error) {
      console.error("Error al obtener turnos:", error);
    }
  }, [fetchAuth, filtros.estado]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar el turno?")) {
      try {
        const response = await fetchAuth(`http://localhost:3000/turnos/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          return window.alert(data.error || "Error al eliminar turno");
        }

        await fetchTurnos();
      } catch {
        window.alert("Error al eliminar turno");
      }
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetchAuth(
        `http://localhost:3000/turnos/${id}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        return window.alert(data.error || "Error al cambiar estado");
      }

      await fetchTurnos();
    } catch {
      window.alert("Error al cambiar estado");
    }
  };

  const turnosFiltrados = turnos.filter(
    (t) =>
      t.paciente_nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
      t.medico_nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
      t.especialidad.toLowerCase().includes(filtros.buscar.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    return <span className={`badge badge-${estado}`}>{estado}</span>;
  };

  return (
    <article>
      <h2>Turnos</h2>

      <div className="grid">
        <input
          type="search"
          placeholder="Buscar por paciente, médico o especialidad..."
          value={filtros.buscar}
          onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
        />
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendido">Atendido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Link role="button" to="/turnos/crear">
          + Nuevo Turno
        </Link>
      </div>

      <figure>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No se encontraron turnos
                </td>
              </tr>
            ) : (
              turnosFiltrados.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.fecha).toLocaleDateString()}</td>
                  <td>{t.hora}</td>
                  <td>{t.paciente_nombre}</td>
                  <td>{t.medico_nombre}</td>
                  <td>{t.especialidad}</td>
                  <td>{getEstadoBadge(t.estado)}</td>
                  <td>
                    <div className="actions-group">
                      {t.estado === "pendiente" && (
                        <>
                          <button
                            className="secondary"
                            onClick={() =>
                              handleCambiarEstado(t.id, "atendido")
                            }
                          >
                            ✓ Atender
                          </button>
                          <button
                            className="secondary outline"
                            onClick={() =>
                              handleCambiarEstado(t.id, "cancelado")
                            }
                          >
                            ✗ Cancelar
                          </button>
                        </>
                      )}
                      <Link
                        role="button"
                        className="secondary"
                        to={`/turnos/${t.id}/modificar`}
                      >
                        Editar
                      </Link>
                      <button
                        className="secondary outline"
                        onClick={() => handleEliminar(t.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </figure>
    </article>
  );
}
