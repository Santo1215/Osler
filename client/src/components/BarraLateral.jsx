import React, { useState, useEffect } from "react";
import "../assets/styles/BarraLateral.css";
import imagotipo from '../assets/img/imagotipo.png';
import iaimg from '../assets/img/iaosler.png'
import {
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaUserMd,
  FaSignOutAlt,
  FaBars,
  FaBookMedical,
} from "react-icons/fa";
import { BsLayoutSidebar } from 'react-icons/bs';
const BarraLateral = () => {
  const [colapsada, setColapsada] = useState(false);
  const [userName, setUserName] = useState('Dr. Jose Meneses');
  const [mostrarLogout, setMostrarLogout] = useState(false);

const toggleLogout = () => {
  setMostrarLogout(!mostrarLogout);
};

const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};

  // Get current path to mark the active link
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');
  
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && (obj.nombre || obj.name)) {
          const nombre = obj.nombre || obj.name;
          const apellido = obj.apellido || '';
          const fullName = apellido ? `${nombre} ${apellido}` : nombre;
          setUserName(fullName);
        }
      }
    } catch (e) {
      // ignore parsing errors
    }
  }, []);


  return (
    <aside className={`barra-lateral ${colapsada ? "colapsada" : ""}`}>
      <div className="logo">
        <img src={imagotipo} alt="Logo Osler" className="imagen-logo" />
        {!colapsada && <h2>OSLER</h2>}
      </div>


      <nav className="menu">
        <a className={isActive('/Home') ? 'active' : ''} href="/Home"><FaHome /> {!colapsada && "Home"}</a>
        <a className={isActive('/Horario') ? 'active' : ''} href="/Horario"><FaClipboardList /> {!colapsada && "Horario"}</a>
        <a className={isActive('/Citas') ? 'active' : ''} href="/Citas"><FaBookMedical /> {!colapsada && "Citas"}</a>
        <a className={isActive('/Estadisticas') ? 'active' : ''} href="/Estadisticas"><FaChartBar /> {!colapsada && "Estadísticas"}</a>
        <a className={isActive('/IA') ? 'active' : ''} href="/IA"><img src={iaimg} className="imagen-ia"/> {!colapsada && "Osler IA"}</a>
      </nav>

<div className="usuario-bloque">
  <div className="usuario" onClick={toggleLogout}>
    <FaUserMd className="icono-usuario" />
    {!colapsada && <span>Dr. {userName}</span>}
  </div>

  {!colapsada && mostrarLogout && (
    <button className="btn-cerrar-sesion desplegado" onClick={handleLogout}>
      <FaSignOutAlt /> Cerrar sesión
    </button>
  )}
</div>


      
      {/* Botón*/}
      <button
        className="boton-colapsar"
        onClick={() => setColapsada(!colapsada)}
        aria-label="Colapsar barra lateral"
      >
        <BsLayoutSidebar />
      </button>
    </aside>
  );
};

export default BarraLateral;
