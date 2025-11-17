import React, { useState, useEffect } from "react";
import "../assets/styles/HorarioSemanal.css";
import { FaPen, FaSave, FaTimes, FaExclamationTriangle, FaPlus } from "react-icons/fa";
import BarraLateral from "./BarraLateral";

const HorarioSemanal = () => {
  const [editable, setEditable] = useState(false);
  const [colapsada, setColapsada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState(null);

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const horas = [
    "06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00",
    "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00",
    "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00",
    "18:00-19:00", "19:00-20:00"
  ];

  const actividadesDisponibles = [
    "Visita hospitalaria",
    "Consulta externa",
    "Cirugías programadas",
    "Revisiones postoperatorias",
    "Quirófano",
    "Guardia de urgencias",
    "Cirugías de urgencias",
    "Guardia 24h",
    "Cita",
    "Descanso",
    "Reunión",
    "Investigación"
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
    "Cita": "#ffd54f",
    "Descanso": "#e6e6e6",
    "Reunión": "#ba68c8",
    "Investigación": "#7986cb"
  };

  // Estado LOCAL para horarios (sin backend)
  const [horarios, setHorarios] = useState([]);
  const [nuevoBloque, setNuevoBloque] = useState({ 
    dia_semana: "Lunes", 
    hora_inicio: "06:00", 
    hora_fin: "07:00", 
    actividad: "", 
    color: "#87CEFA",
    observaciones: ""
  });

  // ================================================
  // 📌 CARGAR HORARIOS - SOLO LOCALSTORAGE
  // ================================================
  const cargarHorarios = () => {
    try {
      setLoading(true);
      
      // Cargar desde localStorage
      const horariosGuardados = localStorage.getItem(`horarios_doctor_${doctorId}`);
      if (horariosGuardados) {
        const horariosData = JSON.parse(horariosGuardados);
        setHorarios(horariosData);
        console.log(`✅ ${horariosData.length} horarios cargados`);
      } else {
        setHorarios([]);
        console.log("✅ Iniciando con horarios vacíos");
      }
      
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // 📌 GUARDAR HORARIOS EN LOCALSTORAGE
  // ================================================
  const guardarHorarios = (nuevosHorarios) => {
    try {
      localStorage.setItem(`horarios_doctor_${doctorId}`, JSON.stringify(nuevosHorarios));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, [doctorId]);

  // Actualizar localStorage cuando cambien los horarios
  useEffect(() => {
    if (horarios.length > 0) {
      guardarHorarios(horarios);
    }
  }, [horarios]);

  // ================================================
  // 📌 AGREGAR NUEVO BLOQUE
  // ================================================
  const handleAdd = () => {
    if (!nuevoBloque.actividad.trim()) {
      alert('Por favor selecciona una actividad');
      return;
    }

    const nuevoId = Date.now(); // ID temporal
    const nuevoHorario = {
      id: nuevoId,
      doctor_id: doctorId,
      ...nuevoBloque,
      color: colores[nuevoBloque.actividad] || nuevoBloque.color
    };
    
    setHorarios(prev => {
      const nuevosHorarios = [...prev, nuevoHorario];
      guardarHorarios(nuevosHorarios);
      return nuevosHorarios;
    });
    
    // Resetear formulario
    setNuevoBloque({ 
      dia_semana: "Lunes", 
      hora_inicio: "06:00", 
      hora_fin: "07:00", 
      actividad: "", 
      color: "#87CEFA",
      observaciones: ""
    });
  };

  // ================================================
  // 📌 ACTUALIZAR BLOQUE
  // ================================================
  const handleUpdate = (id, updates) => {
    setHorarios(prev => {
      const nuevosHorarios = prev.map(h => 
        h.id === id ? { ...h, ...updates } : h
      );
      guardarHorarios(nuevosHorarios);
      return nuevosHorarios;
    });
  };

  // ================================================
  // 📌 ELIMINAR BLOQUE
  // ================================================
  const handleDeleteRequest = (id) => {
    setHorarioToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (!horarioToDelete) return;

    setHorarios(prev => {
      const nuevosHorarios = prev.filter(h => h.id !== horarioToDelete);
      guardarHorarios(nuevosHorarios);
      return nuevosHorarios;
    });
    
    setShowConfirmModal(false);
    setHorarioToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setHorarioToDelete(null);
  };

  // ================================================
  // 📌 GENERAR TABLA
  // ================================================
  const generarTabla = () => {
    const mapa = {};
    
    dias.forEach(dia => {
      mapa[dia] = {};
      horas.forEach(hora => {
        mapa[dia][hora] = null;
      });
    });

    horarios.forEach(horario => {
      const horaKey = `${horario.hora_inicio}-${horario.hora_fin}`;
      if (mapa[horario.dia_semana] && mapa[horario.dia_semana][horaKey] === null) {
        mapa[horario.dia_semana][horaKey] = horario;
      }
    });

    return dias.map(dia => ({
      dia: dia,
      rangos: horas.map(hora => mapa[dia][hora])
    }));
  };

  const bloques = generarTabla();

  const handleCellChange = (horario, nuevaActividad) => {
    if (!horario) return;

    const updates = {
      actividad: nuevaActividad,
      color: colores[nuevaActividad] || horario.color
    };

    handleUpdate(horario.id, updates);
  };

  const formatearHora = (hora) => {
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    
    if (horaNum < 12) return `${horaNum}:${minutos} AM`;
    if (horaNum === 12) return `12:${minutos} PM`;
    return `${horaNum - 12}:${minutos} PM`;
  };

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateral colapsada={colapsada} setColapsada={setColapsada} />

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar este horario?</p>
              <p className="modal-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="horario-container">
        <div className="horario-header">
          <h2>Horario Semanal</h2>
          <div className="controles-horario">
            <button 
              className={`btn-editar ${editable ? 'activo' : ''}`} 
              onClick={() => setEditable(!editable)}
            >
              {editable ? <FaSave /> : <FaPen />}
              {editable ? ' Guardar' : ' Editar Horario'}
            </button>
          </div>
        </div>

        {loading && <div className="cargando">Cargando horarios...</div>}

        {editable && (
          <div className="acciones-horario">
            <h3>Agregar Nuevo Horario</h3>
            <div className="form-agregar">
              <select
                value={nuevoBloque.dia_semana}
                onChange={e => setNuevoBloque({ ...nuevoBloque, dia_semana: e.target.value })}
              >
                {dias.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={nuevoBloque.hora_inicio}
                onChange={e => {
                  const horaInicio = e.target.value;
                  const [hora] = horaInicio.split(':');
                  const horaFin = `${parseInt(hora) + 1}:00`.padStart(5, '0');
                  setNuevoBloque({ 
                    ...nuevoBloque, 
                    hora_inicio: horaInicio,
                    hora_fin: horaFin
                  });
                }}
              >
                {horas.map(hora => {
                  const [horaInicio] = hora.split('-');
                  return (
                    <option key={horaInicio} value={horaInicio}>
                      {formatearHora(horaInicio)}
                    </option>
                  );
                })}
              </select>

              <select
                value={nuevoBloque.actividad}
                onChange={e => setNuevoBloque({ ...nuevoBloque, actividad: e.target.value })}
              >
                <option value="">Seleccionar actividad</option>
                {actividadesDisponibles.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>

              <input
                type="text"
                value={nuevoBloque.observaciones}
                onChange={e => setNuevoBloque({ ...nuevoBloque, observaciones: e.target.value })}
                placeholder="Observaciones (opcional)"
              />

              <button className="btn-agregar" onClick={handleAdd}>
                <FaPlus /> Agregar
              </button>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="tabla-container">
              {horarios.length === 0 && !editable ? (
                <div className="tabla-vacia">
                  <div className="mensaje-vacio">
                    <h3>No hay horarios programados</h3>
                    <p>Presiona "Editar Horario" para comenzar a agregar tus actividades semanales.</p>
                    <button 
                      className="btn-editar-vacio" 
                      onClick={() => setEditable(true)}
                    >
                      <FaPlus /> Comenzar a Programar
                    </button>
                  </div>
                </div>
              ) : (
                <table className="tabla-horario">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      {dias.map(d => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {horas.map((hora, idxHora) => (
                      <tr key={hora}>
                        <td className="col-hora">
                          {hora.split('-').map(formatearHora).join(' - ')}
                        </td>

                        {dias.map((dia, idxDia) => {
                          const horario = bloques[idxDia]?.rangos[idxHora];
                          const actividad = horario?.actividad || "";
                          const color = horario?.color || "#e6e6e6";
                          const observaciones = horario?.observaciones || "";

                          return (
                            <td 
                              key={dia + hora} 
                              style={{ backgroundColor: color }}
                              title={observaciones}
                              className={`celda-horario ${horario ? 'con-actividad' : 'sin-actividad'}`}
                            >
                              {editable && horario ? (
                                <div className="celda-editable">
                                  <select
                                    value={actividad}
                                    onChange={e => handleCellChange(horario, e.target.value)}
                                  >
                                    <option value="">- Seleccionar -</option>
                                    {actividadesDisponibles.map(act => (
                                      <option key={act} value={act}>{act}</option>
                                    ))}
                                  </select>
                                  <button 
                                    className="btn-eliminar" 
                                    onClick={() => handleDeleteRequest(horario.id)}
                                    title="Eliminar horario"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <div className="contenido-celda">
                                  <span className="actividad">{actividad || "-"}</span>
                                  {observaciones && (
                                    <span className="observaciones">({observaciones})</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Leyenda de colores */}
            <div className="leyenda-colores">
              <h4>Leyenda de Actividades:</h4>
              <div className="leyenda-items">
                {Object.entries(colores).map(([actividad, color]) => (
                  <div key={actividad} className="leyenda-item">
                    <div className="leyenda-color" style={{ backgroundColor: color }}></div>
                    <span>{actividad}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HorarioSemanal;