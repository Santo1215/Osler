import React, { useState, useEffect } from "react";
import "../assets/styles/CitasMedicas.css";
import BarraLateral from "./BarraLateral";

const CitasMedicas = () => {
  const [citasHoy, setCitasHoy] = useState([]);
  const [citasProximas, setCitasProximas] = useState([]);
  const [user, setUser] = useState(null);
  const [colapsada, setColapsada] = useState(false);
  const normalizarFecha = (iso) =>{
              const date = new Date(iso);
              const d = date.getDate().toString().padStart(2, "0");
              const m = (date.getMonth() + 1).toString().padStart(2, "0");
              return `${d}/${m}`;
            };

  useEffect(() => {
    const loadCitas = async () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        const u = JSON.parse(raw);
        setUser(u);

        const res = await fetch(`http://localhost:5000/api/doctores/${u.id}/citas`);
        const data = await res.json();

        const hoy = new Date().toISOString().split("T")[0];

        const hoyCitas = data.filter(
          (c) => normalizarFecha(c.fecha_cita) === hoy
        );

        const futurasCitas = data.filter(
          (c) => normalizarFecha(c.fecha_cita) > hoy
        );

        setCitasHoy(hoyCitas);
        setCitasProximas(futurasCitas);

      } catch (err) {
        console.error("Error cargando citas:", err);
      }
    };

    loadCitas();
  }, []);

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateral colapsada={colapsada} setColapsada={setColapsada} />

      <div className="citas-container">

        {/* Citas del día */}
        <h2 className="titulo-citas">Citas del día</h2>
        <table className="tabla-citas">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Estado</th>
              <th>Detalles</th>
              <th>Administrar</th>
            </tr>
          </thead>

          <tbody>
            {citasHoy.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  No tienes citas programadas para hoy.
                </td>
              </tr>
            ) : (
              citasHoy.map((cita) => (
                <tr key={cita.id}>
                  <td>{cita.hora_cita}</td>
                  <td>{cita.paciente_nombre} {cita.paciente_apellido}</td>
                  <td>{cita.estado}</td>
                  <td><button className="btn-link">Ver más</button></td>
                  <td><button className="btn-link">Gestionar Cita</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Próximas citas */}
        <h2 className="titulo-citas">Próximas citas</h2>
        <table className="tabla-citas">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Estado</th>
              <th>Detalles</th>
              <th>Administrar</th>
            </tr>
          </thead>

          <tbody>
            {citasProximas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                  No tienes próximas citas.
                </td>
              </tr>
            ) : (
              citasProximas.map((cita) => (
                <tr key={cita.id}>
                  <td>{new Date(cita.fecha_cita).toLocaleDateString("es-CO", {day: "2-digit",month: "long"})}</td>
                  <td>{cita.hora_cita}</td>
                  <td>{cita.paciente_nombre} {cita.paciente_apellido}</td>
                  <td>{cita.estado}</td>
                  <td><button className="btn-link">Ver más</button></td>
                  <td><button className="btn-link">Gestionar Cita</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default CitasMedicas;
