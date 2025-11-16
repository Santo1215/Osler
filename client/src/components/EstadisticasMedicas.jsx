import React, { useState, useEffect } from "react";
import "../assets/styles/EstadisticasMedicas.css";
import { Pie, Bar } from "react-chartjs-2";
import BarraLateral from "./BarraLateral";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EstadisticasMedicas = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  // Obtener doctorId de localStorage o setear un default para pruebas
  useEffect(() => {
    const id = localStorage.getItem("doctorId") || "1"; // poner un ID válido aquí
    setDoctorId(id);
  }, []);

  useEffect(() => {
    if (!doctorId) return;

    const fetchEstadisticas = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/doctores/${doctorId}/estadisticas/semanal`);
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        const data = await res.json();
        console.log("Datos backend:", data);
        setEstadisticas(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las estadísticas");
        setEstadisticas({
          total_pacientes_atendidos: 0,
          pacientes_masculinos: 0,
          pacientes_femeninos: 0,
          pacientes_otro: 0,
          total_cirugias: 0,
          tasa_complicaciones: 0,
          duracion_promedio_consulta: 0,
          cirugias_baja_complejidad: 0,
          cirugias_media_complejidad: 0,
          cirugias_alta_complejidad: 0,
          enfermedades_comunes: [],
        });
      }
    };

    fetchEstadisticas();
  }, [doctorId]);

  if (!estadisticas) return <p>Cargando estadísticas...</p>;

  const totalPacientes = estadisticas.total_pacientes_atendidos;
  const generoData = [estadisticas.pacientes_masculinos, estadisticas.pacientes_femeninos, estadisticas.pacientes_otro];
  const complicacionesData = [
    totalPacientes - estadisticas.total_cirugias * (estadisticas.tasa_complicaciones / 100),
    estadisticas.total_cirugias * (estadisticas.tasa_complicaciones / 100),
  ];
  const cirugiasData = [
    estadisticas.cirugias_baja_complejidad,
    estadisticas.cirugias_media_complejidad,
    estadisticas.cirugias_alta_complejidad,
  ];
  const enfermedades = estadisticas.enfermedades_comunes.map(e => `${e.name} (${e.count})`);

  return (
    <div className="layout-principal">
      <BarraLateral />
      <main className="contenido-estadisticas">
        <h1>Estadísticas Médicas</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="grid-estadisticas">
          <div className="caja-estadistica">
            <h2>Cantidad de pacientes</h2>
            <p className="numero">{totalPacientes}</p>
          </div>

          <div className="caja-estadistica">
            <h2>Género de los pacientes</h2>
            <Pie data={{ labels: ["Hombres", "Mujeres", "Otro"], datasets: [{ data: generoData, backgroundColor: ["#1b7cb0", "#f17a7a", "#77c2f7"] }] }} />
          </div>

          <div className="caja-estadistica">
            <h2>Tasa de complicaciones</h2>
            <Bar data={{ labels: ["Sin complicaciones", "Con complicaciones"], datasets: [{ label: "Casos", data: complicacionesData.map(d => Math.round(d)), backgroundColor: ["#1b7cb0", "#f1b04c"] }] }} />
          </div>

          <div className="caja-estadistica">
            <h2>Causas frecuentes</h2>
            <ul>{enfermedades.map((enf, idx) => <li key={idx}>{enf}</li>)}</ul>
          </div>

          <div className="caja-estadistica">
            <h2>Distribución de cirugías por complejidad</h2>
            <Pie data={{ labels: ["Baja", "Media", "Alta"], datasets: [{ data: cirugiasData, backgroundColor: ["#77c2f7", "#1b7cb0", "#f17a7a"] }] }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EstadisticasMedicas;
