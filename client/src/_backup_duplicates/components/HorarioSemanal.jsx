import React, { useState } from "react";
import "../assets/styles/HorarioSemanal.css";
import { FaPen } from "react-icons/fa";
import BarraLateral from "./BarraLateral";

const HorarioSemanal = () => {
  const [editable, setEditable] = useState(false);

  const [horario, setHorario] = useState({
    lunes: {
      "9:00-10:00 AM": "Visita hospitalaria",
      "12:00-1:00 PM": "Cirugías programadas",
    },
    martes: {
      "9:00-10:00 AM": "Consulta externa",
      "3:00-4:00 PM": "Revisiones postoperatorias",
    },
    miercoles: {
      "8:00-10:00 AM": "Quirófano",
      "2:00-4:00 PM": "Guardia de urgencias",
    },
    jueves: {
      "8:00-9:00 AM": "Visita hospitalaria",
      "11:00-1:00 PM": "Cirugías programadas",
    },
    viernes: {
      "9:00-10:00 AM": "Consulta externa",
      "3:00-5:00 PM": "Cirugías de urgencias",
    },
    sabado: {
      "8:00 PM-8:00 AM": "Guardia 24h",
    },
  });

  const horas = [
    "6:00-7:00 AM",
    "7:00-8:00 AM",
    "8:00-9:00 AM",
    "9:00-10:00 AM",
    "10:00-11:00 AM",
    "11:00-12:00 M",
    "12:00-1:00 PM",
    "1:00-2:00 PM",
    "2:00-3:00 PM",
    "3:00-4:00 PM",
    "4:00-5:00 PM",
    "5:00-6:00 PM",
    "6:00-7:00 PM",
    "7:00-8:00 PM",
  ];

  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  const colores = {
    "Visita hospitalaria": "#b6dfb7",
    "Consulta externa": "#6ac7c3",
    "Cirugías programadas": "#a7d7ee",
    "Revisiones postoperatorias": "#9aaec9",
    "Quirófano": "#3d8ed6",
    "Guardia de urgencias": "#f5861f",
    "Cirugías de urgencias": "#d94e4e",
    "Guardia 24h": "#f5861f",
  };

  const handleChange = (dia, hora, valor) => {
    setHorario({
      ...horario,
      [dia.toLowerCase()]: {
        ...horario[dia.toLowerCase()],
        [hora]: valor,
      },
    });
  };
  const [colapsada, setColapsada] = useState(false);
  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
    <BarraLateral colapsada={colapsada} setColapsada={setColapsada} />
    <div className="horario-container">
      <div className="horario-header">
        <h2>Horario</h2>
        <button
          className="btn-editar"
          onClick={() => setEditable(!editable)}
          title="Editar horario"
        >
          Editar <FaPen />
        </button>
      </div>

      <table className="tabla-horario">
        <thead>
          <tr>
            <th>Hora</th>
            {dias.map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((hora) => (
            <tr key={hora}>
              <td className="col-hora">{hora}</td>
              {dias.map((dia) => {
                const actividad = horario[dia.toLowerCase()]?.[hora] || "";
                const color = colores[actividad] || "#e6e6e6";
                return (
                  <td
                    key={dia + hora}
                    style={{ backgroundColor: actividad ? color : "#e6e6e6" }}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={actividad}
                        onChange={(e) =>
                          handleChange(dia, hora, e.target.value)
                        }
                      />
                    ) : (
                      <span>{actividad}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default HorarioSemanal;