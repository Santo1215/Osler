import React from "react";
import "../assets/styles/DetallesSoftware.css";
import { FaUsers } from "react-icons/fa";

const detalles = [
  { titulo: "Apoyo al diagnóstico" },
  { titulo: "Accesible en diversos dispositivos" },
  { titulo: "Integración con otros sistemas" },
  { titulo: "Funciones Analíticas" },
  { titulo: "Escalable" },
  { titulo: "Predicción de riesgos con IA" },
];

export default function DetallesSoftware() {
  return (
    <section id="detalles" className="detalles-section">
      <div className="contenedor-detalles">
        <h2 className="titulo-detalles">Detalles del software</h2>
        <p className="subtitulo-detalles">
          Propiedades del software por los cuales nos destacamos
        </p>

        <div className="grid-detalles">
          {detalles.map((item, index) => (
            <div key={index} className="tarjeta-detalle">
              <div className="icono-detalle">
                <FaUsers size={32} color="#fff" />
              </div>
              <p>{item.titulo}</p>
            </div>
          ))}
        </div>

        <button className="btn-detalles">Detalles</button>
      </div>
    </section>
  );
}
