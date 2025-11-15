import React from "react";
import "../assets/styles/HomeP.css";
import BarraLateralP from "./BarraLateralP";
import { useState } from "react";

const HomeP = () => {
  const nombreUsuario = "Mateo Delgado";
  const proximaCita = "20/09/2025";

  const manejarSolicitud = () => {
    // Navigate to the patient appointments page
    window.location.href = "/Citas-P";
  };

  const manejarCancelacion = () => {
    if (window.confirm("¿Desea cancelar su próxima cita?")) {
      alert("Cita cancelada correctamente.");
    }
  };
  const [colapsada, setColapsada] = useState(false);
  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
    <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />
    <div className="homep-container">
      <h2 className="saludo">Hola, {nombreUsuario}</h2>

      <button className="btn-solicitar" onClick={manejarSolicitud}>
        Solicitar una cita
      </button>

      <div className="card-cita">
        <h3 className="titulo-card">Citas</h3>
        <p className="texto-card">
          Su próxima cita será el <strong>{proximaCita}</strong>
        </p>
        <button className="btn-cancelar" onClick={manejarCancelacion}>
          Cancelar
        </button>
      </div>

      <p className="mensaje-final">
        Recuerda que en <strong>Osler</strong> cuidamos de tu tiempo y tu salud.
        Tu bienestar es nuestra prioridad.
      </p>
    </div>
    </div>
  );
};

export default HomeP;