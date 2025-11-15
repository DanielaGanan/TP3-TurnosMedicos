import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { AuthPage, AuthProvider } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Pacientes } from "./Pacientes.jsx";
import { CrearPaciente } from "./CrearPaciente.jsx";
import { ModificarPaciente } from "./ModificarPaciente.jsx";
import { Medicos } from "./Medicos.jsx";
import { CrearMedico } from "./CrearMedicos.jsx";
import { ModificarMedico } from "./ModificarMedico.jsx";
import { Turnos } from "./Turnos.jsx";
import { CrearTurno } from "./CrearTurno.jsx";
import { ModificarTurno } from "./ModificarTurno.jsx";
import { Registro } from "./Registro.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="registro" element={<Registro />} />

            {/* Rutas de Pacientes */}
            <Route
              path="pacientes"
              element={
                <AuthPage>
                  <Pacientes />
                </AuthPage>
              }
            />
            <Route
              path="pacientes/crear"
              element={
                <AuthPage>
                  <CrearPaciente />
                </AuthPage>
              }
            />
            <Route
              path="pacientes/:id/modificar"
              element={
                <AuthPage>
                  <ModificarPaciente />
                </AuthPage>
              }
            />

            {/* Rutas de Medicos */}
            <Route
              path="medicos"
              element={
                <AuthPage>
                  <Medicos />
                </AuthPage>
              }
            />
            <Route
              path="medicos/crear"
              element={
                <AuthPage>
                  <CrearMedico />
                </AuthPage>
              }
            />
            <Route
              path="medicos/:id/modificar"
              element={
                <AuthPage>
                  <ModificarMedico />
                </AuthPage>
              }
            />

            {/* Rutas de Turnos */}
            <Route
              path="turnos"
              element={
                <AuthPage>
                  <Turnos />
                </AuthPage>
              }
            />
            <Route
              path="turnos/crear"
              element={
                <AuthPage>
                  <CrearTurno />
                </AuthPage>
              }
            />
            <Route
              path="turnos/:id/modificar"
              element={
                <AuthPage>
                  <ModificarTurno />
                </AuthPage>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
