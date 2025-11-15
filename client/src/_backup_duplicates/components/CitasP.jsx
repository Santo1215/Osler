import React, { useState } from "react";
import "../assets/styles/CitasP.css";
import BarraLateralP from "./BarraLateralP";

const CitasP = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    genero: "",
    telefono: "",
    direccion: "",
    barrio: "",
    email: "",
  });

  const [colapsada, setColapsada] = useState(false);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    alert("Cita solicitada correctamente");
  };

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />
      <div className="citas-container">
      <h2 className="titulo-principal">Citas</h2>

      <div className="tarjetas-container">
        <div className="tarjeta">
          <h3>Citas</h3>
          <p>
            Su próxima cita será el <strong>20/09/2025</strong>
          </p>
          <p>El doctor asignado es <strong>Dr. Jose Meneses</strong></p>
          <button className="btn-info">Más información</button>
        </div>

        <div className="tarjeta">
          <h3>Cirugías</h3>
          <p>
            Su próxima cirugía será el <strong>22/09/2025</strong>
          </p>
          <p>El doctor asignado es <strong>Dr. Jose Meneses</strong></p>
          <button className="btn-info">Más información</button>
        </div>
      </div>

      <form className="formulario" onSubmit={manejarEnvio}>
        <div className="fila">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={manejarCambio}
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={manejarCambio}
          />
        </div>

        <div className="fila">
          <select
            name="genero"
            value={formData.genero}
            onChange={manejarCambio}
          >
            <option value="">Género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={manejarCambio}
          />
        </div>

        <div className="fila">
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={manejarCambio}
          />
          <input
            type="text"
            name="barrio"
            placeholder="Barrio"
            value={formData.barrio}
            onChange={manejarCambio}
          />
        </div>

        <div className="fila">
          <input
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={manejarCambio}
          />
        </div>

        <div className="agenda-container">
          <div className="calendar-box">
            <label>Agenda</label>
            <input type="date" name="fecha" />
          </div>
          <div className="horas-box">
            <label>Horarios disponibles</label>
            <div className="horas">
              {['01:00', '02:00', '03:00', '06:00', '07:00', '08:00'].map(
                (hora) => (
                  <button type="button" key={hora}>
                    {hora}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-solicitar">
          Solicitar cita
        </button>
        </form>
      </div>
    </div>
  );
};

export default CitasP;