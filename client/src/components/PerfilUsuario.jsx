import React, { useState, useEffect } from "react";
import "../assets/styles/PerfilUsuario.css";
import { FaUser, FaPen } from "react-icons/fa";
import BarraLateralP from "./BarraLateralP";

const PerfilUsuario = () => {
  const [editable, setEditable] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [backupPerfil, setBackupPerfil] = useState(null);
  const [colapsada, setColapsada] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Cargar perfil desde backend
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const id = user && user.id;
        const res = await fetch(`http://localhost:5000/api/pacientes/${id}`, {
          credentials: "include",
        });

        const data = await res.json();
        console.log("Perfil cargado:", data);

        setPerfil({
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          direccion: data.direccion,
          genero: data.genero,
          email: data.email,
          barrio: data.barrio,

          // separar fecha de nacimiento en partes
          dia: data.fecha_nacimiento ? new Date(data.fecha_nacimiento).getDate() : "",
          mes: data.fecha_nacimiento
            ? new Date(data.fecha_nacimiento).toLocaleString("es", { month: "long" })
            : "",
          año: data.fecha_nacimiento
            ? new Date(data.fecha_nacimiento).getFullYear()
            : "",
        });

      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    fetchPerfil();
  }, []);

  // Manejo de inputs
  const handleChange = (campo, value) => {
    setPerfil({ ...perfil, [campo]: value });
  };

  // Editar
  const startEditing = () => {
    setBackupPerfil(perfil);
    setEditable(true);
  };

  const cancelEditing = () => {
    setPerfil(backupPerfil);
    setEditable(false);
  };

  // Guardar cambios
  const saveEditing = async () => {
    try {
      const meses = {
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12",
    };
    const mesNumero = meses[perfil.mes.toLowerCase()];
      const body = {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        genero: perfil.genero,
        direccion: perfil.direccion,
        telefono: perfil.telefono,
        email: perfil.email,
        barrio: perfil.barrio,
        fecha_nacimiento: `${perfil.año}-${mesNumero}-${perfil.dia}`,
      };
      

      const res = await fetch(`http://localhost:5000/api/pacientes/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al actualizar perfil");

      alert("Perfil actualizado correctamente");
      setEditable(false);

    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al actualizar.");
    }
  };

  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div className={`layout-principal ${colapsada ? "colapsada" : ""}`}>
      <BarraLateralP colapsada={colapsada} setColapsada={setColapsada} />

      <div className="perfil-container">
        <h1>Mi Perfil</h1>

        {/* Encabezado */}
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
              />
              <input
                type="text"
                value={perfil.apellido}
                disabled={!editable}
                onChange={(e) => handleChange("apellido", e.target.value)}
              />
            </div>

            <div className="fecha-ciudad">
              <input
                type="text"
                value={perfil.dia}
                disabled
              />
              <input
                type="text"
                value={perfil.mes}
                disabled
              />
              <input
                type="text"
                value={perfil.año}
                disabled={!editable}
                onChange={(e) => handleChange("año", e.target.value)}
              />
            </div>
          </div>

          <div className="acciones-perfil">
            {!editable ? (
              <button className="btn-editar" onClick={startEditing}>
                Editar <FaPen />
              </button>
            ) : (
              <div className="grupo-guardar">
                <button className="btn-guardar" onClick={saveEditing}>Guardar</button>
                <button className="btn-cancelar-edicion" onClick={cancelEditing}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="perfil-info">
          <div className="fila">
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
              <label>Barrio</label>
              <input
                type="text"
                value={perfil.barrio}
                disabled={!editable}
                onChange={(e) => handleChange("barrio", e.target.value)}
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

          <h3>Contacto</h3>
          <div className="fila">
            <input
              type="email"
              value={perfil.email}
              disabled={!editable}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <input
              type="text"
              value={perfil.telefono}
              disabled={!editable}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
