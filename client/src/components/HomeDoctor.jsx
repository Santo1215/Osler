import React, { useEffect, useState } from "react";
import "../assets/styles/HomeDoctor.css";
import BarraLateral from "./BarraLateral";
import PerfilCompletoForm from "./PerfilCompletoForm";
import { useNavigate } from "react-router-dom"; // AÑADE ESTA IMPORTACIÓN

const HomeD = () => {
  const navigate = useNavigate(); // AÑADE ESTO
  const [user, setUser] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [citas, setCitas] = useState([]);

  // ============================
  // 1. Cargar doctor desde localStorage + backend
  // ============================
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        // Intentar cargar desde la sesión del servidor
        const response = await fetch("http://localhost:5000/api/auth/current-user", {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Usuario cargado desde sesión:', userData);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setNeedsProfile(!isProfileComplete(userData));
          
          // Cargar citas
          const resCitas = await fetch(
            `http://localhost:5000/api/doctores/${userData.id}/citas`
          );
          const citasData = await resCitas.json();
          setCitas(citasData);
        } else {
          // Fallback a localStorage
          const raw = localStorage.getItem("user");
          if (raw) {
            const u = JSON.parse(raw);
            setUser(u);
            setNeedsProfile(!isProfileComplete(u));
          } else {
            navigate("/login");
          }
        }
      } catch (err) {
        console.error("Error cargando el doctor:", err);
        // Fallback a localStorage
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          setUser(u);
          setNeedsProfile(!isProfileComplete(u));
        } else {
          navigate("/login");
        }
      }
    };

    loadDoctor();
  }, [navigate]);

  // ============================
  // Verificar perfil completo
  // ============================
  const isProfileComplete = (u) => {
    if (!u) return false;

    const required = [
      u.nombre,
      u.apellido,
      u.especialidad,
      u.descripcion,
      u.consultorio,
      u.email,
      u.telefono,
    ];

    return required.every(
      (v) => typeof v === "string" && v.trim().length > 0
    );
  };

  // ============================
  // Al guardar perfil completo
  // ============================
  const handleSaved = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.location.reload();
  };

  return (
    <div className="contenedor-home">
      <BarraLateral />

      <main className="contenido-principal">
        {needsProfile ? (
          <PerfilCompletoForm user={user} onSaved={handleSaved} />
        ) : (
          <>
            <h1>
              Hola, Dr.{" "}
              {user &&
                `${user.nombre || ""} ${user.apellido || ""}`.trim()}
            </h1>

            <div className="contenedor-cajas">
              <div className="caja citas">
                <h2>Citas de hoy</h2>

                {citas.length === 0 ? (
                  <p>No tienes citas para hoy.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((cita) => (
                        <tr key={cita.id}>
                          <td>
                            {cita.paciente_nombre} {cita.paciente_apellido}
                          </td>
                          <td>{cita.hora_cita}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="caja estadisticas">
                <h2>Estadísticas</h2>
                <p>Cirugías realizadas esta semana:</p>
                <table>
                  <thead>
                    <tr>
                      <th>Cirugía</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Colecistectomías</td>
                      <td>4</td>
                    </tr>
                    <tr>
                      <td>Hernias</td>
                      <td>3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomeD;  