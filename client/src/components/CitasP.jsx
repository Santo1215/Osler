import React, { useState, useEffect } from "react";
import "../assets/styles/CitasP.css";
import BarraLateralP from "./BarraLateralP";

const CitasP = () => {
  const [user, setUser] = useState(null);
  const [citas, setCitas] = useState([]);
  const [cirugias, setCirugias] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [doctores, setDoctores] = useState([]);
  const [tiposCita, setTiposCita] = useState([]);
  
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    tipo_cita: "Consulta",
  });

  const [colapsada, setColapsada] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitAssignedDoctor, setSubmitAssignedDoctor] = useState(null);

  const cancelarCita = async (idCita) => {
  if (!window.confirm("¿Seguro deseas cancelar esta cita?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/citas/${idCita}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al cancelar cita");
    }

    // Actualiza la lista de citas
    if (user && user.id) fetchCitas(user.id);

  } catch (error) {
    console.error("Error cancelando cita:", error);
    alert("No se pudo cancelar la cita");
  }
};

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const obj = JSON.parse(raw);
        setUser(obj);
        if (obj && obj.id) {
          fetchCitas(obj.id);
        }
      }
    } catch (e) {
      console.error('Error reading user:', e);
    }
  }, []);

  useEffect(() => {
    fetchDoctores();
  }, []);

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tipos-cita');
      if (res.ok) {
        const data = await res.json();
        // Expecting array of { key, label } or array of strings
        if (Array.isArray(data)) {
          const normalized = data.map(item => {
            if (typeof item === 'string') return { key: item, label: item };
            return { key: item.key || item.label, label: item.label || item.key };
          });
          setTiposCita(normalized);
        }
      }
    } catch (err) {
      console.error('Error fetching tipos de cita:', err);
    }
  };

  const fetchCitas = async (pacienteId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/citas-paciente/${pacienteId}`);
      if (res.ok) {
        const data = await res.json();
        // Normalize rows: ensure each item has a tipo_cita property (use motivo column)
        const normalized = (data || []).map((c) => ({
          ...c,
          tipo_cita: c.tipo_cita || c.motivo || '',
        }));

        // Separate citas and cirugías based on tipo_cita / motivo
        const citasData = normalized.filter(c => c.tipo_cita && c.tipo_cita.toString().toLowerCase().includes('cirug')) || [];
        const citasNormales = normalized.filter(c => !c.tipo_cita || !c.tipo_cita.toString().toLowerCase().includes('cirug')) || [];
        setCitas(citasNormales);
        setCirugias(citasData);
      }
    } catch (err) {
      console.error('Error fetching citas:', err);
    } finally {
      setLoadingCitas(false);
    }
  };

  const fetchDoctores = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctores');
      if (res.ok) {
        const data = await res.json();
        setDoctores(data);
      }
    } catch (err) {
      console.error('Error fetching doctores:', err);
    }
  };

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (!user || !user.id) throw new Error('Usuario no identificado');
      if (!formData.fecha) throw new Error('Selecciona una fecha');
      if (!formData.hora) throw new Error('Selecciona una hora');
      if (!doctores || doctores.length === 0) throw new Error('No hay doctores disponibles');

      // Seleccionar doctor aleatoriamente
      const randomDoc = doctores[Math.floor(Math.random() * doctores.length)];
      const assignedDoctorId = randomDoc.id;

  
      // The server expects 'motivo' column for the appointment reason/type
      const payload = {
        id_paciente: user.id,
        id_doctor: assignedDoctorId,
        fecha: formData.fecha,
        hora: formData.hora,
        tipo_cita: formData.tipo_cita,
      };

      const res = await fetch('http://localhost:5000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al solicitar cita');
      }

      setSubmitSuccess(true);
      // show assigned doctor in success message
      setSubmitAssignedDoctor(randomDoc ? (randomDoc.nombre || randomDoc.name) : null);
      setFormData({ fecha: "", hora: "", tipo_cita: "Consulta" });
      // Reload citas
      if (user && user.id) {
        setTimeout(() => fetchCitas(user.id), 1000);
      }
    } catch (err) {
      setSubmitError(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />
      <div className="citas-container">
      <h2 className="titulo-principal">Citas</h2>

      <div className="tarjetas-container">
        <div className="tarjeta">
          <h3>Citas</h3>
          {loadingCitas ? (
            <p>Cargando citas...</p>
          ) : citas && citas.length > 0 ? (
            <div>
              {citas.map((cita, index) => (
                <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <p>Su próxima cita será el <strong>{cita.fecha}</strong> a las <strong>{cita.hora}</strong></p>
                  <p>El doctor asignado es <strong>Dr. {cita.doctor}</strong></p>
                  <p><em>Tipo de cita: {cita.tipo_cita}</em></p>
                   {/* BOTÓN PARA CANCELAR */}
                    <button 
                      onClick={() => cancelarCita(cita.id)} 
                      style={{
                        marginTop: "8px",
                        background: "#d9534f",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Cancelar cita
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No tienes citas agendadas</p>
          )}
        </div>

        <div className="tarjeta">
          <h3>Cirugías</h3>
          {loadingCitas ? (
            <p>Cargando cirugías...</p>
          ) : cirugias && cirugias.length > 0 ? (
            <div>
              {cirugias.map((cirugia, index) => (
                <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <p>Su próxima cirugía será el <strong>{cirugia.fecha}</strong> a las <strong>{cirugia.hora}</strong></p>
                  <p>El doctor asignado es <strong>Dr. {cirugia.doctor}</strong></p>
                  <p><em>Tipo de cita: {cirugia.tipo_cita}</em></p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tienes cirugías agendadas</p>
          )}
        </div>
      </div>

      <form className="formulario" onSubmit={manejarEnvio}>
        <h3>Solicitar una nueva cita</h3>
        
        <div className="fila">
          <div className="agenda-container">
            <div className="calendar-box">
              <label>Fecha</label>
              <input 
                type="date" 
                name="fecha" 
                value={formData.fecha}
                onChange={manejarCambio}
                required
              />
            </div>
            <div className="horas-box">
              <label>Hora</label>
              <input 
                type="time" 
                name="hora" 
                value={formData.hora}
                onChange={manejarCambio}
                required
              />
            </div>
          </div>
        </div>

        <div className="fila">
          <select
            name="tipo_cita"
            value={formData.tipo_cita}
            onChange={manejarCambio}
            required
          >
            {tiposCita && tiposCita.length > 0 ? (
              tiposCita.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))
            ) : (
              <>
                <option value="Prioritaria">Prioritaria</option>
                <option value="Electiva">Electiva</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Prequirurgica">Prequirurgica</option>
              </>
            )}
          </select>
        </div>

        {/* Doctor se asigna aleatoriamente; no se muestra selector */}

        {submitError && <div style={{ color: 'red', marginBottom: '10px' }}>{submitError}</div>}
        {submitSuccess && (
          <div style={{ color: 'green', marginBottom: '10px' }}>
            ¡Cita solicitada correctamente!{submitAssignedDoctor ? ` Doctor asignado: Dr. ${submitAssignedDoctor}` : ''}
          </div>
        )}

        <button type="submit" className="btn-solicitar" disabled={submitting}>
          {submitting ? 'Solicitando...' : 'Solicitar cita'}
        </button>
        </form>
      </div>
    </div>
  );
};

export default CitasP;
