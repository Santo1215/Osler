import React, { useState } from "react";
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
const BarraLateral = ({ colapsada: propColapsada, setColapsada: propSetColapsada }) => {
  // allow parent to control collapsed state; fallback to internal state
  const [internalColapsada, setInternalColapsada] = useState(false);
  const [userName, setUserName] = useState('Mateo Fonseca');
  const colapsada = typeof propColapsada === 'boolean' ? propColapsada : internalColapsada;
  const setColapsada = typeof propSetColapsada === 'function' ? propSetColapsada : setInternalColapsada;

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

  // detect current path so the active link can be highlighted
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');
  

  return (
    <aside className={`barra-lateral ${colapsada ? "colapsada" : ""}`}>
      <div className="logo">
        <img src={imagotipo} alt="Logo Osler" className="imagen-logo" />
        {!colapsada && <h2>OSLER</h2>}
      </div>


      <nav className="menu">
        <a className={isActive('/Home-P') ? 'active' : ''} href="/Home-P"><FaHome /> {!colapsada && "Home"}</a>
        <a className={isActive('/Citas-P') ? 'active' : ''} href="/Citas-P"><FaBookMedical /> {!colapsada && "Citas"}</a>
        <a className={isActive('/Perfil') ? 'active' : ''} href="/Perfil"><FaClipboardList /> {!colapsada && "Perfil"}</a>
      </nav>

      <div className="usuario">
        <FaUserMd className="icono-usuario" />
        {!colapsada && <span>{userName}</span>}
      </div>

      {/* Botón tipo ChatGPT */}
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
