import { Link } from "react-router";
import { useAuth } from "./Auth";

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <article>
      <h1>Sistema de Gestión de Turnos Médicos</h1>
      {isAuthenticated ? (
        <>
          <p>
            Bienvenido/a, <strong>{user?.nombre}</strong>!
          </p>
          <p>
            Gestiona pacientes, medicos y turnos desde el menu de navegación.
          </p>
          <div className="grid">
            <Link role="button" to="/pacientes">
              Ver Pacientes
            </Link>
            <Link role="button" to="/medicos">
              Ver Médicos
            </Link>
            <Link role="button" to="/turnos">
              Ver Turnos
            </Link>
          </div>
        </>
      ) : (
        <>
          <p>
            Bienvenido al sistema de gestión de turnos médicos. Por favor,
            inicia sesión para continuar.
          </p>
        </>
      )}
    </article>
  );
};
