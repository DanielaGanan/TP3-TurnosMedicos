import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router";

export function Medicos() {
  const { fetchAuth } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [buscar, setBuscar] = useState("");

  const fetchMedicos = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/medicos");
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error:", data.error);
        return;
      }

      setMedicos(data.medicos);
    } catch (error) {
      console.error("Error al obtener médicos:", error);
    }
  }, [fetchAuth]);

  useEffect(() => {
    fetchMedicos();
  }, [fetchMedicos]);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar el médico?")) {
      try {
        const response = await fetchAuth(
          `http://localhost:3000/medicos/${id}`,
          { method: "DELETE" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          return window.alert(data.error || "Error al eliminar médico");
        }

        await fetchMedicos();
      } catch {
        window.alert("Error al eliminar médico");
      }
    }
  };

  const medicosFiltrados = medicos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      m.apellido.toLowerCase().includes(buscar.toLowerCase()) ||
      m.especialidad.toLowerCase().includes(buscar.toLowerCase()) ||
      m.matricula_profesional.includes(buscar)
  );

  return (
    <article>
      <h2>Médicos</h2>
      <div className="grid-filters">
        <input
          type="search"
          placeholder="Buscar por nombre, especialidad o matrícula..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <Link role="button" to="/medicos/crear">
          + Nuevo Médico
        </Link>
      </div>

      <figure>
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Apellido</th>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No se encontraron médicos
                </td>
              </tr>
            ) : (
              medicosFiltrados.map((m) => (
                <tr key={m.id}>
                  <td>{m.matricula_profesional}</td>
                  <td>{m.apellido}</td>
                  <td>{m.nombre}</td>
                  <td>{m.especialidad}</td>
                  <td>
                    <div className="actions-group">
                      <Link
                        role="button"
                        className="secondary"
                        to={`/medicos/${m.id}/modificar`}
                      >
                        Editar
                      </Link>
                      <button
                        className="secondary outline"
                        onClick={() => handleEliminar(m.id)}
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
