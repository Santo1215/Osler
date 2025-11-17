import React, { useState } from "react";
import "../assets/styles/Modal.css";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; // Icono de Google
import logo from "../assets/img/Oslerlogo.png";

const ModalLogin = ({ isOpen, onClose, onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (typeof onLogin === "function") onLogin(formData);
    if (typeof onClose === "function") onClose();
  };

  const iniciarConGoogle = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (typeof onClose === "function") onClose();
        }
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="logo-container">
          <img src={logo} alt="Logo Osler" className="logo-osler" />
        </div>

        <h2>
          Inicia sesión en <span>Osler</span>
        </h2>

        <form onSubmit={manejarEnvio}>
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={manejarCambio}
            required
            autoComplete="email"
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              onChange={manejarCambio}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="btn-login">
            Iniciar sesión
          </button>
        </form>

        {/* --- BOTÓN DE GOOGLE --- */}
        <button type="button" className="btn-google" onClick={iniciarConGoogle}>
          <FcGoogle size={24} style={{ marginRight: "8px" }} />
          Continuar con Google
        </button>

        <p className="registro-texto">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            className="link-registro"
            onClick={() => {
              if (typeof onSwitchToRegister === "function") onSwitchToRegister();
            }}
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default ModalLogin;
