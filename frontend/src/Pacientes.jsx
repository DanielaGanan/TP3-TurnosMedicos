import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router";

export function Pacientes() {
  const { fetchAuth } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [buscar, setBuscar] = useState("");

  const fetchPacientes = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/pacientes");
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Error:", data.error);
        return;
      }

      setPacientes(data.pacientes);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  }, [fetchAuth]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar el paciente?")) {
      try {
        const response = await fetchAuth(
          `http://localhost:3000/pacientes/${id}`,
          { method: "DELETE" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          return window.alert(data.error || "Error al eliminar paciente");
        }

        await fetchPacientes();
      } catch {
        window.alert("Error al eliminar paciente");
      }
    }
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      p.apellido.toLowerCase().includes(buscar.toLowerCase()) ||
      p.DNI.includes(buscar)
  );

  return (
    <article>
      <h2>Pacientes</h2>
      <div className="grid-filters">
        <input
          type="search"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <Link role="button" to="/pacientes/crear">
          + Nuevo Paciente
        </Link>
      </div>

      <figure>
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Apellido</th>
              <th>Nombre</th>
              <th>Fecha Nac.</th>
              <th>Obra Social</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.DNI}</td>
                  <td>{p.apellido}</td>
                  <td>{p.nombre}</td>
                  <td>{new Date(p.fecha_nacimiento).toLocaleDateString()}</td>
                  <td>{p.obra_social || "-"}</td>
                  <td>
                    <div className="actions-group">
                      <Link
                        role="button"
                        className="secondary"
                        to={`/pacientes/${p.id}/modificar`}
                      >
                        Editar
                      </Link>
                      <button
                        className="secondary outline"
                        onClick={() => handleEliminar(p.id)}
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
