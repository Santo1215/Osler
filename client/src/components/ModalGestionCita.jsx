import React, { useState } from "react";
import "../assets/styles/ModalCitas.css";

const ModalGestionCita = ({ cita, doctor, onClose }) => {
  const [mostrarCirugia, setMostrarCirugia] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [antecedentesPatologicos, setAntecedentesPatologicos] = useState("");
  const [antecedentesNoPatologicos, setAntecedentesNoPatologicos] = useState("");
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState("");
  const [alergias, setAlergias] = useState("");
  const [inmunizaciones, setInmunizaciones] = useState("");
  const [saludSexual, setSaludSexual] = useState("");
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
        observaciones,
        antecedentes_patologicos: antecedentesPatologicos,
        antecedentes_no_patologicos: antecedentesNoPatologicos,
        antecedentes_familiares: antecedentesFamiliares,
        alergias,
        inmunizaciones,
        salud_sexual: saludSexual
      })
    });
  };

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
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const finalizarCita = async () => {
    try {
      if (diagnostico || tratamiento || observaciones || antecedentesPatologicos || antecedentesNoPatologicos) {
        await guardarHistorial();
      }

      await fetch(`http://localhost:5000/api/citas/${cita.id}/finalizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Completada" })
      });

      if (mostrarCirugia && cirugia.tipo) {
        await guardarCirugia();
      }

      alert("Cita finalizada");
      onClose();

    } catch (err) {
      console.error(err);
      alert("Error finalizando la cita");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Gestionar Cita</h2>

        <h3>Agregar al historial</h3>
          <div className="historial-field">
            <h4>Antecedentes patológicos</h4>
            <textarea onChange={e => setAntecedentesPatologicos(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Antecedentes no patológicos</h4>
            <textarea onChange={e => setAntecedentesNoPatologicos(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Antecedentes familiares</h4>
            <textarea onChange={e => setAntecedentesFamiliares(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Alergias</h4>
            <textarea onChange={e => setAlergias(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Inmunizaciones</h4>
            <textarea onChange={e => setInmunizaciones(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Salud sexual</h4>
            <textarea onChange={e => setSaludSexual(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Observaciones</h4>
            <textarea onChange={e => setObservaciones(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Diagnóstico</h4>
            <textarea onChange={e => setDiagnostico(e.target.value)} />
          </div>

          <div className="historial-field">
            <h4>Tratamiento</h4>
            <textarea onChange={e => setTratamiento(e.target.value)} />
          </div>

          <button onClick={guardarHistorial}>Guardar en historial</button>

        <hr />

        <div>
      {/* Toggle switch */}
      <label style={{ display: "flex", marginBottom: "10px" }}>
        <input 
          type="checkbox" 
          checked={mostrarCirugia} 
          onChange={() => setMostrarCirugia(!mostrarCirugia)} 
        />
        Mostrar sección de cirugía
      </label>

      {/* Sección de cirugía */}
      {mostrarCirugia && (
        <div className="cirugia-section">
          <h3>Remitir a cirugía</h3>

          <div className="historial-field">
            <h4>Tipo cirugía</h4>
            <input 
              type="text" 
              placeholder="Tipo de cirugía" 
              onChange={e => setCirugia({ ...cirugia, tipo: e.target.value })} 
            />
          </div>

          <div className="historial-field">
            <h4>Nivel de complejidad</h4>
            <select onChange={e => setCirugia({ ...cirugia, complejidad: e.target.value })}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div className="historial-field">
            <h4>Descripción</h4>
            <textarea 
              placeholder="Motivo de la remisión a cirugía"
              onChange={e => setCirugia({ ...cirugia, descripcion: e.target.value })} 
            />
          </div>

          <button onClick={guardarCirugia}>Programar cirugía</button>
        </div>
      )}
    </div>
    <button className="btn-finalizar" onClick={finalizarCita}>Finalizar Cita</button>
      </div>
    </div>
  );
};

export default ModalGestionCita;
