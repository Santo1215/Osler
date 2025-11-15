import React, { useState } from "react";
import "../assets/styles/ModalCitas.css";

const ModalGestionCita = ({ cita, doctor, onClose }) => {

  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [cirugia, setCirugia] = useState({
    tipo: "",
    complejidad: "Media",
    duracion_horas: 1,
    complicaciones: false,
    descripcion: "",
  });

  // Guardar historial
  const guardarHistorial = async () => {
    await fetch("http://localhost:5000/api/historial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente_id: cita.paciente_id,
        doctor_id: doctor.id,
        diagnostico,
        tratamiento,
        observaciones
      })
    });
    alert("Guardado en el historial médico");
  };

  // Registrar cirugía
  const guardarCirugia = async () => {
    await fetch("http://localhost:5000/api/cirugias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctor.id,
        paciente_id: cita.paciente_id,
        fecha: new Date().toISOString().split("T")[0],
        ...cirugia
      })
    });
    alert("Cirugía registrada");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Gestionar Cita</h2>

        <h3>Agregar al historial</h3>
        <textarea placeholder="Diagnóstico" onChange={e => setDiagnostico(e.target.value)} />
        <textarea placeholder="Tratamiento" onChange={e => setTratamiento(e.target.value)} />
        <textarea placeholder="Observaciones" onChange={e => setObservaciones(e.target.value)} />

        <button onClick={guardarHistorial}>Guardar en historial</button>

        <hr />

        <h3>Remitir a cirugía</h3>

        <input type="text" placeholder="Tipo de cirugía" onChange={e => setCirugia({ ...cirugia, tipo: e.target.value })} />

        <select onChange={e => setCirugia({ ...cirugia, complejidad: e.target.value })}>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>

        <input type="number" min="0" step="0.5"
          placeholder="Duración (horas)"
          onChange={e => setCirugia({ ...cirugia, duracion_horas: e.target.value })}
        />

        <textarea placeholder="Descripción" onChange={e => setCirugia({ ...cirugia, descripcion: e.target.value })} />

        <button onClick={guardarCirugia}>Registrar cirugía</button>

      </div>
    </div>
  );
};

export default ModalGestionCita;
