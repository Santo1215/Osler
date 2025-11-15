import React, { useState } from "react";
import "../assets/styles/PerfilUsuario.css";
import { FaUser, FaPen } from "react-icons/fa";
import BarraLateralP from "./BarraLateralP";
import "../assets/styles/EstadisticasMedicas.css";

const PerfilUsuario = () => {
  
  const [editable, setEditable] = useState(false);

  const initialPerfil = {
    nombre: "Mateo",
    apellido: "Delgado",
    dia: "15",
    mes: "Junio",
    año: "2005",
    ciudad: "Bucaramanga",
    documento: "1095755355",
    direccion: "Calle 46 #9occ-49",
    ocupacion: "Estudiante",
    genero: "Masculino",
    emailPersonal: "mateofonseca77@gmail.com",
    emailInstitucional: "mateo2221906@correo.uis.edu.co",
    telefono: "301 4110195",
    contactoEmergencia: "Gloria Fonseca",
    telefonoEmergencia: "6355050",
    relacion: "Madre",
  };

  const [perfil, setPerfil] = useState(initialPerfil);
  // backup used to revert changes when cancelling edit
  const [backupPerfil, setBackupPerfil] = useState(null);

  const handleChange = (campo, valor) => setPerfil({ ...perfil, [campo]: valor });

  const [colapsada, setColapsada] = useState(false);

  const startEditing = () => {
    setBackupPerfil(perfil);
    setEditable(true);
  };

  const cancelEditing = () => {
    if (backupPerfil) setPerfil(backupPerfil);
    setBackupPerfil(null);
    setEditable(false);
  };

  const saveEditing = () => {
    // Here you would call an API to save the profile. We'll just close edit mode.
    setBackupPerfil(null);
    setEditable(false);
    alert('Perfil guardado localmente.');
  };

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />
      <div className="perfil-container">
      <h1>Mi perfil</h1>

      <div className="perfil-header">
        <div className="icono-usuario">
          <FaUser />
        </div>
        <div className="perfil-nombres">
          <div className="nombre-apellido">
            <input
              type="text"
              value={perfil.nombre}
              disabled={!editable}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={perfil.apellido}
              disabled={!editable}
              onChange={(e) => handleChange("apellido", e.target.value)}
              placeholder="Apellido"
            />
          </div>

          <div className="fecha-ciudad">
            <input
              type="text"
              value={perfil.dia}
              disabled={!editable}
              onChange={(e) => handleChange("dia", e.target.value)}
              placeholder="Día"
            />
            <input
              type="text"
              value={perfil.mes}
              disabled={!editable}
              onChange={(e) => handleChange("mes", e.target.value)}
              placeholder="Mes"
            />
            <input
              type="text"
              value={perfil.año}
              disabled={!editable}
              onChange={(e) => handleChange("año", e.target.value)}
              placeholder="Año"
            />
            <input
              type="text"
              value={perfil.ciudad}
              disabled={!editable}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              placeholder="Ciudad"
            />
          </div>
        </div>

        <div className="acciones-perfil">
          {!editable ? (
            <button className="btn-editar" onClick={startEditing} title="Editar perfil">
              Editar <FaPen />
            </button>
          ) : (
            <div className="grupo-guardar">
              <button className="btn-guardar" onClick={saveEditing}>Guardar</button>
              <button className="btn-cancelar-edicion" onClick={cancelEditing}>Cancelar</button>
            </div>
          )}
        </div>
      </div>

      <div className="perfil-info">
        <div className="fila">
          <div>
            <label>Documento</label>
            <input
              type="text"
              value={perfil.documento}
              disabled={!editable}
              onChange={(e) => handleChange("documento", e.target.value)}
            />
          </div>
          <div>
            <label>Dirección</label>
            <input
              type="text"
              value={perfil.direccion}
              disabled={!editable}
              onChange={(e) => handleChange("direccion", e.target.value)}
            />
          </div>
          <div>
            <label>Ocupación</label>
            <input
              type="text"
              value={perfil.ocupacion}
              disabled={!editable}
              onChange={(e) => handleChange("ocupacion", e.target.value)}
            />
          </div>
          <div>
            <label>Género</label>
            <input
              type="text"
              value={perfil.genero}
              disabled={!editable}
              onChange={(e) => handleChange("genero", e.target.value)}
            />
          </div>
        </div>

        <h3>Información de contacto</h3>
        <div className="fila">
          <input
            type="email"
            value={perfil.emailPersonal}
            disabled={!editable}
            onChange={(e) => handleChange("emailPersonal", e.target.value)}
          />
          <input
            type="email"
            value={perfil.emailInstitucional}
            disabled={!editable}
            onChange={(e) => handleChange("emailInstitucional", e.target.value)}
          />
          <input
            type="text"
            value={perfil.telefono}
            disabled={!editable}
            onChange={(e) => handleChange("telefono", e.target.value)}
          />
        </div>

        <h3>Contacto de emergencia</h3>
        <div className="fila">
          <input
            type="text"
            value={perfil.contactoEmergencia}
            disabled={!editable}
            onChange={(e) => handleChange("contactoEmergencia", e.target.value)}
          />
          <input
            type="text"
            value={perfil.telefonoEmergencia}
            disabled={!editable}
            onChange={(e) => handleChange("telefonoEmergencia", e.target.value)}
          />
          <input
            type="text"
            value={perfil.relacion}
            disabled={!editable}
            onChange={(e) => handleChange("relacion", e.target.value)}
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default PerfilUsuario;