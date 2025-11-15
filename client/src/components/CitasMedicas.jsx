import React, { useState }  from "react";
import "../assets/styles/CitasMedicas.css";
import BarraLateral from "./BarraLateral";

const CitasMedicas = () => {
  const citas = [
    {
      hora: "8:00 AM",
      paciente: "Mateo Delgado",
    },
    {
      hora: "11:00 AM",
      paciente: "Daniel Sandoval",
    },
    {
      hora: "3:00 PM",
      paciente: "Esteban Suarez",
    },
  ];
    const [colapsada, setColapsada] = useState(false);
  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
    <BarraLateral colapsada={colapsada} setColapsada={setColapsada} />
    <div className="citas-container">
      <h2 className="titulo-citas">Citas</h2>
      <table className="tabla-citas">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Detalles</th>
            <th>Administrar</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita, index) => (
            <tr key={index}>
              <td>{cita.hora}</td>
              <td>{cita.paciente}</td>
              <td>
                <button className="btn-link">Ver más</button>
              </td>
              <td>
                <button className="btn-link">Gestionar Cita</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default CitasMedicas;
