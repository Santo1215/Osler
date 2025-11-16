import React, { useEffect, useState } from "react";
import "../assets/styles/ModalCitas.css";

const ModalDetallesPaciente = ({ pacienteId, onClose }) => {
  const [data, setData] = useState(null);
  const [cita, setCita] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Traer datos completos del paciente
      const resPaciente = await fetch(`http://localhost:5000/api/pacientes/${pacienteId}/completo`);
      const jsonPaciente = await resPaciente.json();
      setData(jsonPaciente);

      // Traer la cita pendiente o más reciente del paciente
      const resCita = await fetch(`http://localhost:5000/api/citas/doctores/${pacienteId}`);
      const jsonCita = await resCita.json();
      setCita(jsonCita[0]); // supondremos la primera cita de la lista
    };
    load();
  }, [pacienteId]);

  if (!data) return null;

  const { paciente, historial, cirugias } = data;

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Información del paciente</h2>

        <section>
          <h3>Datos personales</h3>
          <p><strong>Nombre:</strong> {paciente.nombre} {paciente.apellido}</p>
          <p><strong>Email:</strong> {paciente.email}</p>
          <p><strong>Teléfono:</strong> {paciente.telefono}</p>
          <p><strong>Género:</strong> {paciente.genero}</p>
          <p><strong>Dirección:</strong> {paciente.direccion}</p>
          <p><strong>Fecha de nacimiento:</strong> {new Date(paciente.fecha_nacimiento).toLocaleDateString()}</p>
        </section>

        <section>
          <h3>Motivo de la cita</h3>
          <p>{data.cita?.motivo || "No especificado"}</p>
        </section>

        <section>
          <h3>Historial médico</h3>
          {historial.length === 0 ? (
            <p>No hay historial registrado</p>
          ) : (
            historial.map((h) => (
              <div key={h.id} className="item">
                <p><strong>Diagnóstico:</strong> {h.diagnostico}</p>
                <p><strong>Tratamiento:</strong> {h.tratamiento}</p>
                <p><strong>Observaciones:</strong> {h.observaciones}</p>
                <hr />
              </div>
            ))
          )}
        </section>

        <section>
          <h3>Cirugías</h3>
          {cirugias.length === 0 ? (
            <p>No hay cirugías registradas</p>
          ) : (
            cirugias.map((c) => (
              <div key={c.id} className="item">
                <p><strong>Fecha:</strong> {new Date(c.fecha).toLocaleDateString()}</p>
                <p><strong>Tipo:</strong> {c.tipo}</p>
                <p><strong>Complejidad:</strong> {c.complejidad}</p>
                <p><strong>Duración:</strong> {c.duracion_horas} horas</p>
                <p><strong>Complicaciones:</strong> {c.complicaciones ? "Sí" : "No"}</p>
                <p><strong>Descripción:</strong> {c.descripcion}</p>
                <hr />
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  );
};

export default ModalDetallesPaciente;
