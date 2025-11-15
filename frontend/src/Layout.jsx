import { Outlet, Link } from "react-router";
import { useAuth } from "./Auth.jsx"; 
import { Ingresar } from "./Ingresar.jsx"; 

export const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link to="/">
              <strong>Turnos Médicos</strong>
            </Link>
          </li>
        </ul>
        <ul>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/pacientes">Pacientes</Link>
              </li>
              <li>
                <Link to="/medicos">Médicos</Link>
              </li>
              <li>
                <Link to="/turnos">Turnos</Link>
              </li>
            </>
          )}
        </ul>
        <ul>
          {isAuthenticated ? (
            <>
              <li>
                <small>👤 {user?.nombre}</small>
              </li>
              <li>
                <button onClick={() => logout()} className="secondary">
                  Salir
                </button>
              </li>
            </>
          ) : (
            <li>
              <Ingresar />
            </li>
          )}
        </ul>
      </nav>
      <Outlet />
    </main>
  );
};
