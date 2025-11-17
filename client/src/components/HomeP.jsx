import React, { useState, useEffect } from "react";
import "../assets/styles/HomeP.css";
import BarraLateralP from "./BarraLateralP";
import PerfilCompletoFormP from "./PerfilCompletoFormP";
import { useNavigate } from "react-router-dom";

const HomeP = () => {
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("Paciente");
  const [user, setUser] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [colapsada, setColapsada] = useState(false);

  // ============================
  // 1. Cargar usuario desde sesión + backend
  // ============================
  useEffect(() => {
    const loadUser = async () => {
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
          
          // Nombre mostrado
          const nombre = userData.nombre || userData.name || "";
          const apellido = userData.apellido || "";
          setNombreUsuario(apellido ? `${nombre} ${apellido}` : nombre);
          
          // ¿Perfil completo?
          setNeedsProfile(!isProfileComplete(userData));
          
          // Cargar citas del paciente
          if (userData?.id) fetchCitas(userData.id);
        } else {
          // Fallback a localStorage
          const raw = localStorage.getItem("user");
          if (!raw) {
            navigate("/login");
            return;
          }

          const storedUser = JSON.parse(raw);
          setUser(storedUser);
          
          // Nombre mostrado
          const nombre = storedUser.nombre || storedUser.name || "";
          const apellido = storedUser.apellido || "";
          setNombreUsuario(apellido ? `${nombre} ${apellido}` : nombre);
          
          setNeedsProfile(!isProfileComplete(storedUser));
          
          // Cargar citas del paciente
          if (storedUser?.id) fetchCitas(storedUser.id);
        }
      } catch (error) {
        console.error("Error cargando datos del paciente:", error);
        // Fallback a localStorage
        const raw = localStorage.getItem("user");
        if (raw) {
          const storedUser = JSON.parse(raw);
          setUser(storedUser);
          setNeedsProfile(!isProfileComplete(storedUser));
        } else {
          navigate("/login");
        }
      }
    };

    loadUser();
  }, [navigate]);

  // ============================
  // Función: traer citas del paciente
  // ============================
  const fetchCitas = async (pacienteId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/citas-paciente/${pacienteId}`
      );
      const data = await res.json();
      setCitas(data);
    } catch (err) {
      console.error("Error fetching citas:", err);
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  // ============================
  // Verificar perfil completo
  // ============================
  const isProfileComplete = (u) => {
    if (!u) return false;

    console.log('Validando perfil del usuario:', u);

    const campos = [
      u.nombre,
      u.apellido,
      u.email,
      u.telefono,
      u.genero,
      u.fecha_nacimiento,
    ];

    const todosCompletos = campos.every(
      (v) => v !== null && v !== undefined && v !== '' && v.toString().trim().length > 0
    );

    console.log('¿Perfil completo?', todosCompletos);
    console.log('Campos validados:', campos.map((campo, index) => 
      `${['nombre', 'apellido', 'email', 'telefono', 'genero', 'fecha_nacimiento'][index]}: ${campo}`
    ));

    return todosCompletos;
  };

  // ============================
  // Cuando se guarda el perfil completo - DEFINIR ESTA FUNCIÓN
  // ============================
  const handleSaved = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.location.reload();
  };

  // ============================
  // Render
  // ============================
  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />

      <div className="homep-container">
        {needsProfile ? (
          <PerfilCompletoFormP user={user} onSaved={handleSaved} />
        ) : (
          <>
            <h2 className="saludo">Hola, {nombreUsuario}</h2>

            <button
              className="btn-solicitar"
              onClick={() => navigate("/Citas-P")}
            >
              Solicitar una cita
            </button>

            <div className="card-cita">
              <h3 className="titulo-card">Citas</h3>

              {loadingCitas ? (
                <p className="texto-card">Cargando citas...</p>
              ) : citas.length > 0 ? (
                citas.map((cita, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "15px",
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <p className="texto-card">
                      <strong>Doctor:</strong> {cita.doctor || "No especificado"}
                    </p>
                    <p className="texto-card">
                      <strong>Fecha:</strong> {cita.fecha || "N/A"}
                    </p>
                    <p className="texto-card">
                      <strong>Hora:</strong> {cita.hora || "N/A"}
                    </p>
                    <p className="texto-card">
                      <strong>Tipo de Cita:</strong> {cita.tipo_cita || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="texto-card">No tienes citas próximas</p>
              )}
            </div>

            <p className="mensaje-final">
              Recuerda que en <strong>Osler</strong> cuidamos de tu tiempo y tu
              salud. Tu bienestar es nuestra prioridad.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeP;