import React, { useState, useEffect } from "react";
import "../assets/styles/HomeDoctor.css";
import BarraLateral from "./BarraLateral";
import PerfilCompletoForm from "./PerfilCompletoForm";

const HomeD = () => {
  const [user, setUser] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
  const loadDoctor = async () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        setUser(null);
        setNeedsProfile(true);
        return;
      }

      const u = JSON.parse(raw);
      setUser(u);

      // Solo cargar si tiene ID
      if (!u.id) {
        console.warn("El usuario no tiene ID, no se puede cargar desde backend");
        setNeedsProfile(true);
        return;
      }

      // Traer datos reales del backend
      const res = await fetch(`http://localhost:5000/api/doctores/${u.id}`);
      const doctor = await res.json();

      setUser(doctor);
      localStorage.setItem("user", JSON.stringify(doctor));

      // Verificar perfil completo
      setNeedsProfile(!isProfileComplete(doctor));
      
      if (u.id) {
      const resCitas = await fetch(`http://localhost:5000/api/doctores/${u.id}/citas`);
      const citasData = await resCitas.json();
      setCitas(citasData);
}

    } catch (err) {
      console.error("Error cargando el doctor:", err);
      setNeedsProfile(true);
    }
  };

  loadDoctor();
}, []);


const isProfileComplete = (u) => {
  if (!u) return false;

  const required = [
    u.nombre,
    u.apellido,
    u.especialidad,
    u.descripcion,
    u.consultorio,
    u.email,
    u.telefono
  ];

  return required.every(
    (value) => typeof value === "string" && value.trim().length > 0
  );
};


  const handleSaved = (updatedUser) => {
    // Save to localStorage and reload to ensure all components reflect the update
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('No se pudo actualizar localStorage', e);
    }
    // Simple approach: reload page so BarraLateral and other components pick up changes
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
            <h1>Hola, Dr. {user && ((user.nombre || user.name || '') + (user.apellido ? ' ' + user.apellido : ''))}</h1>

            <div className="contenedor-cajas">
              <div className="caja citas">
                <h2>Citas</h2>

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
                          <td>{cita.paciente_nombre} {cita.paciente_apellido}</td>
                          <td>{cita.hora_cita}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>


              <div className="caja estadisticas">
                <h2>Estadísticas</h2>
                <p>Cirugías realizadas en la última semana:</p>
                <table>
                  <thead>
                    <tr><th>Cirugía</th><th>Cantidad</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Colecistectomías</td><td>4</td></tr>
                    <tr><td>Hernias</td><td>3</td></tr>
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
