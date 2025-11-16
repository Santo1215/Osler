import React, { useState, useEffect } from "react";
import "../assets/styles/HorarioSemanal.css";
import { FaPen } from "react-icons/fa";
import BarraLateral from "./BarraLateral";

const HorarioSemanal = () => {
  const [editable, setEditable] = useState(false);
  const [colapsada, setColapsada] = useState(false);

  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const horas = [
    "6:00-7:00 AM", "7:00-8:00 AM", "8:00-9:00 AM", "9:00-10:00 AM",
    "10:00-11:00 AM", "11:00-12:00 M", "12:00-1:00 PM", "1:00-2:00 PM",
    "2:00-3:00 PM", "3:00-4:00 PM", "4:00-5:00 PM", "5:00-6:00 PM",
    "6:00-7:00 PM", "7:00-8:00 PM"
  ];

  const colores = {
    "Visita hospitalaria": "#b6dfb7",
    "Consulta externa": "#6ac7c3",
    "Cirugías programadas": "#a7d7ee",
    "Revisiones postoperatorias": "#9aaec9",
    "Quirófano": "#3d8ed6",
    "Guardia de urgencias": "#f5861f",
    "Cirugías de urgencias": "#d94e4e",
    "Guardia 24h": "#f5861f",
    "Cita": "#ffd54f"
  };

  // ================================
  // 📌 ESTADO INICIAL DEL HORARIO
  // ================================
  const [horarioBase, setHorarioBase] = useState([
    { dia: "lunes", rango: "9:00-10:00 AM", titulo: "Visita hospitalaria" },
    { dia: "lunes", rango: "12:00-1:00 PM", titulo: "Cirugías programadas" },
    { dia: "martes", rango: "9:00-10:00 AM", titulo: "Consulta externa" },
    { dia: "martes", rango: "3:00-4:00 PM", titulo: "Revisiones postoperatorias" },
    { dia: "miercoles", rango: "8:00-9:00 AM", titulo: "Quirófano" },
    { dia: "miercoles", rango: "9:00-10:00 AM", titulo: "Quirófano" },
    { dia: "miercoles", rango: "2:00-3:00 PM", titulo: "Guardia de urgencias" },
    { dia: "miercoles", rango: "3:00-4:00 PM", titulo: "Guardia de urgencias" },
    { dia: "jueves", rango: "8:00-9:00 AM", titulo: "Visita hospitalaria" },
    { dia: "jueves", rango: "11:00-12:00 M", titulo: "Cirugías programadas" },
    { dia: "viernes", rango: "9:00-10:00 AM", titulo: "Consulta externa" },
    { dia: "viernes", rango: "3:00-4:00 PM", titulo: "Cirugías de urgencias" },
    { dia: "sabado", rango: "7:00-8:00 PM", titulo: "Guardia 24h" },
  ]);

  const [citas, setCitas] = useState([
    { dia: "martes", rango: "10:00-11:00 AM", titulo: "Cita con paciente A" },
    { dia: "jueves", rango: "2:00-3:00 PM", titulo: "Cita con paciente B" },
  ]);

  const [bloques, setBloques] = useState([]);
  const [nuevoBloque, setNuevoBloque] = useState({ dia: "lunes", rango: horas[0], titulo: "" });

  // ================================================
  // 📌 1. CARGAR DATOS DESDE LOCALSTORAGE AL INICIAR
  // ================================================
  useEffect(() => {
    const dataHorario = localStorage.getItem("horarioBase");
    const dataCitas = localStorage.getItem("citas");

    if (dataHorario) setHorarioBase(JSON.parse(dataHorario));
    if (dataCitas) setCitas(JSON.parse(dataCitas));
  }, []);

  // ====================================================
  // 📌 2. GUARDAR AUTOMÁTICAMENTE CUANDO HAY CAMBIOS
  // ====================================================
  useEffect(() => {
    localStorage.setItem("horarioBase", JSON.stringify(horarioBase));
  }, [horarioBase]);

  useEffect(() => {
    localStorage.setItem("citas", JSON.stringify(citas));
  }, [citas]);

  // ====================================================
  // 📌 GENERAR LA TABLA A PARTIR DE ACTIVIDADES + CITAS
  // ====================================================
  useEffect(() => {
    const mapa = {};
    dias.forEach(d => (mapa[d] = {}));

    horarioBase.forEach(b => {
      mapa[b.dia][b.rango] = {
        ...b,
        tipo: "actividad",
        color: colores[b.titulo] || "#e6e6e6"
      };
    });

    citas.forEach(c => {
      mapa[c.dia][c.rango] = {
        ...c,
        tipo: "cita",
        color: colores["Cita"]
      };
    });

    const resultado = dias.map(d => ({
      dia: d,
      rangos: horas.map(h => mapa[d][h] || null)
    }));

    setBloques(resultado);
  }, [horarioBase, citas]);

  // ====================
  // 📌 EDITAR ACTIVIDAD
  // ====================
  const handleEdit = (dia, hora, nuevoTitulo) => {
    setHorarioBase(prev =>
      prev.map(b =>
        b.dia === dia && b.rango === hora ? { ...b, titulo: nuevoTitulo } : b
      )
    );
  };

  // ====================
  // 📌 ELIMINAR ACTIVIDAD
  // ====================
  const handleDelete = (dia, hora) => {
    setHorarioBase(prev => prev.filter(b => !(b.dia === dia && b.rango === hora)));
    setCitas(prev => prev.filter(c => !(c.dia === dia && c.rango === hora)));
  };

  // ====================
  // 📌 AGREGAR ACTIVIDAD
  // ====================
  const handleAdd = () => {
    if (!nuevoBloque.titulo.trim()) return;

    setHorarioBase(prev => [...prev, { ...nuevoBloque }]);
    setNuevoBloque({ dia: "lunes", rango: horas[0], titulo: "" });
  };

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateral colapsada={colapsada} setColapsada={setColapsada} />

      <div className="horario-container">
        <div className="horario-header">
          <h2>Horario</h2>
          <button className="btn-editar" onClick={() => setEditable(!editable)}>
            Editar <FaPen />
          </button>
        </div>

        {editable && (
          <div className="acciones-horario">
            <select
              value={nuevoBloque.dia}
              onChange={e => setNuevoBloque({ ...nuevoBloque, dia: e.target.value })}
            >
              {dias.map(d => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={nuevoBloque.rango}
              onChange={e => setNuevoBloque({ ...nuevoBloque, rango: e.target.value })}
            >
              {horas.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <input
              type="text"
              value={nuevoBloque.titulo}
              onChange={e => setNuevoBloque({ ...nuevoBloque, titulo: e.target.value })}
              placeholder="Actividad"
            />

            <button className="btn-agregar" onClick={handleAdd}>Agregar</button>
          </div>
        )}

        <table className="tabla-horario">
          <thead>
            <tr>
              <th>Hora</th>
              {dias.map(d => (
                <th key={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {horas.map((hora, idxHora) => (
              <tr key={hora}>
                <td className="col-hora">{hora}</td>

                {dias.map((dia, idxDia) => {
                  const bloque = bloques[idxDia]?.rangos[idxHora];
                  const actividad = bloque?.titulo || "";
                  const color = bloque?.color || "#e6e6e6";

                  return (
                    <td key={dia + hora} style={{ backgroundColor: color }}>
                      {editable ? (
                        <div className="celda-editable">
                          <input
                            type="text"
                            value={actividad}
                            onChange={e => handleEdit(dia, hora, e.target.value)}
                          />
                          <button className="btn-eliminar" onClick={() => handleDelete(dia, hora)}>
                            ×
                          </button>
                        </div>
                      ) : (
                        <span>{actividad || "-"}</span>
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
