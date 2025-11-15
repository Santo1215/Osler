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
  // 1. Cargar usuario + traer datos completos
  // ============================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    setUser(storedUser);

    const fetchFullUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/pacientes/${storedUser.id}`
        );
        const data = await res.json();

        // Guardar usuario completo
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);

      } catch (error) {
        console.error("Error cargando datos del paciente:", error);
      }
    };

    fetchFullUser();
  }, []);

  // ============================
  // 2. Detectar perfil incompleto + cargar citas
  // ============================
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const obj = JSON.parse(raw);
        setUser(obj);

        const nombre = obj.nombre || obj.name;
        const apellido = obj.apellido || "";
        setNombreUsuario(apellido ? `${nombre} ${apellido}` : nombre);

        setNeedsProfile(!isProfileComplete(obj));

        if (obj?.id) fetchCitas(obj.id);
      } else {
        setUser(null);
        setNeedsProfile(true);
      }
    } catch (e) {
      setUser(null);
      setNeedsProfile(true);
    }
  }, []);

  // ============================
  // Función: traer citas del paciente
  // ============================
  const fetchCitas = async (pacienteId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/citas-paciente/${pacienteId}`
      );
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      } else {
        setCitas([]);
      }
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

    console.log("Usuario cargado:", u);
    console.log("Teléfono:", u.telefono);
    console.log("Dirección:", u.direccion);
    console.log("Género:", u.genero);

    const campos = [
      u.nombre,
      u.apellido,
      u.email,
      u.telefono,
      u.genero,
    ];

    return campos.every(
      (value) => typeof value === "string" && value.trim().length > 0
    );
  };

  const handleSaved = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.location.reload();
  };

  const manejarSolicitud = () => {
    navigate("/Citas-P");
  };

  const manejarCancelacion = (citaId) => {
    if (window.confirm("¿Desea cancelar esta cita?")) {
      alert("Cita cancelada correctamente.");
      // Aquí irá la cancelación real en la BD.
    }
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

            <button className="btn-solicitar" onClick={manejarSolicitud}>
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
                    <button
                      className="btn-cancelar"
                      onClick={() => manejarCancelacion(cita.id)}
                    >
                      Cancelar cita
                    </button>
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
