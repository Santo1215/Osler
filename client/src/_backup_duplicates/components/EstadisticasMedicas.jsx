import React, { useState }  from "react";
import "../assets/styles/EstadisticasMedicas.css";
import { Pie, Bar } from "react-chartjs-2";
import BarraLateral from "./BarraLateral";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EstadisticasMedicas = () => {
  
  return (
    <div className={`layout-principal `}>
      <BarraLateral />

      <main className="contenido-estadisticas">
        <h1>Estadísticas Médicas</h1>

        <div className="grid-estadisticas">
          {/* Caja 1: Total pacientes */}
          <div className="caja-estadistica ">
            <h2>Cantidad de pacientes</h2>
            <p className="numero">11</p>
          </div>

          {/* Caja 2: Género de pacientes */}
          <div className="caja-estadistica">
            <h2>Género de los pacientes</h2>
            <Pie
              data={{
                labels: ["Hombres", "Mujeres"],
                datasets: [
                  {
                    data: [7, 4],
                    backgroundColor: ["#1b7cb0", "#f17a7a"],
                  },
                ],
              }}
            />
          </div>

          {/* Caja 3: Complicaciones */}
          <div className="caja-estadistica">
            <h2>Tasa de complicaciones</h2>
            <Bar
              data={{
                labels: ["Sin complicaciones", "Con complicaciones"],
                datasets: [
                  {
                    label: "Casos",
                    data: [9, 2],
                    backgroundColor: ["#1b7cb0", "#f1b04c"],
                  },
                ],
              }}
            />
          </div>

          {/* Caja 4: Duración promedio */}
          <div className="caja-estadistica">
            <h2>Duración promedio consultas</h2>
            <Bar
              data={{
                labels: ["Prequirúrgicas", "Postoperatorias"],
                datasets: [
                  {
                    label: "Minutos",
                    data: [25, 15],
                    backgroundColor: ["#1b7cb0", "#77c2f7"],
                  },
                ],
              }}
            />
          </div>

          {/* Caja 5: Causas frecuentes */}
          <div className="caja-estadistica">
            <h2>Causas frecuentes</h2>
            <ul>
              <li>Apendicitis</li>
              <li>Hernia umbilical</li>
              <li>Colecistitis aguda</li>
            </ul>
          </div>

          {/* Caja 6: Distribución de cirugías */}
          <div className="caja-estadistica">
            <h2>Distribución de cirugías</h2>
            <Pie
              data={{
                labels: ["Electivas", "Urgencias"],
                datasets: [
                  {
                    data: [60, 40],
                    backgroundColor: ["#77c2f7", "#f17a7a"],
                  },
                ],
              }}
            />
          </div>

          {/* Caja 7: Complejidad */}
          <div className="caja-estadistica">
            <h2>Complejidad de cirugías</h2>
            <Pie
              data={{
                labels: ["Baja complejidad", "Complejas"],
                datasets: [
                  {
                    data: [70, 30],
                    backgroundColor: ["#77c2f7", "#1b7cb0"],
                  },
                ],
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EstadisticasMedicas;