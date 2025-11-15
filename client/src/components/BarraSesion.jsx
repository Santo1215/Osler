import React from "react";
import "../assets/styles/barrasesion.css";
import logo from "../assets/img/logo_largo.png";

// BarraSesion now accepts optional callbacks to open modals from parent.
const BarraSesion = ({ onOpenLogin, onOpenRegister }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <img src={logo} alt="Osler Logo" className="logo" />
        </div>

        <nav className="nav-links">
          {onOpenLogin ? (
            <button type="button" className="link" onClick={onOpenLogin}> <span>Iniciar Sesión</span></button>
          ) : (
            <a href="/login" className="link">Iniciar Sesión</a>
          )}

          {onOpenRegister ? (
            <button type="button" className="btn-register" onClick={onOpenRegister}><span>Registrarse</span></button>
          ) : (
            <a href="/register" className="btn-register">Registrarse</a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default BarraSesion;
