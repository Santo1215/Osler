import React, { useState } from "react";
import "../assets/styles/Modal.css";
import logo from "../assets/img/Oslerlogo.png";

const ModalRegister = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [rol, setRol] = useState("paciente");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'

  if (!isOpen) return null;

  const BACKEND = process.env.REACT_APP_BACKEND || 'http://localhost:5000';

  function isStrongPassword(pw) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  setLoading(true);
  setMensaje("");
  setMessageType("");

    const form = e.target;
    const data = {
      usuario: form.usuario.value.trim(),
      numDocumento: form.numDocumento ? form.numDocumento.value.trim() : '',
      correo: form.correo.value.trim(),
      password: form.password.value.trim(),
      rol,
    };

    // Client-side password strength check
    if (!isStrongPassword(data.password)) {
      setMensaje('La contraseña debe tener mínimo 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Optional: pre-check if email exists by calling an optional endpoint
    try {
      const checkRes = await fetch(`${BACKEND}/api/check-email?email=${encodeURIComponent(data.correo)}`);
      if (checkRes.ok) {
        // assume JSON { exists: true/false }
        const j = await checkRes.json();
        if (j && j.exists) {
          setMensaje('El correo ya está registrado. Por favor usa otro.');
          setLoading(false);
          return;
        }
      }
      // if 404 or other, we ignore and continue to attempt registration; server will report duplicate if any
    } catch (err) {
      // ignore network errors for the pre-check and proceed
      console.debug('Email check skipped or failed:', err.message);
    }

    try {
      // 👇 Aquí conectamos con tu backend
      const res = await fetch("http://localhost:5000/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setMensaje("Registro exitoso. Ya puedes iniciar sesión.");
        setMessageType('success');
        form.reset();
        setRol("paciente");
      } else {
        setMensaje(`Error: ${result.message || "No se pudo registrar"}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error de conexión con el servidor");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === "function") onClose();
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-osler" />
        </div>

        <h2>
          Crea tu <span>cuenta</span>
        </h2>

        <form onSubmit={handleSubmit}>
          <input name="usuario" type="text" placeholder="Nombre" required />
          <input name="numDocumento" type="text" placeholder="Número de documento" required />
          <input name="correo" type="email" placeholder="Correo" required />
          <input name="password" type="password" placeholder="Contraseña" required />

          <div className="role-select">
            <p>Seleccione su rol</p>
            <label>
              <input
                type="radio"
                name="rol"
                value="doctor"
                checked={rol === "doctor"}
                onChange={() => setRol("doctor")}
              />
              <span className="role-option">Doctor</span>
            </label>
            <label>
              <input
                type="radio"
                name="rol"
                value="paciente"
                checked={rol === "paciente"}
                onChange={() => setRol("paciente")}
              />
              <span className="role-option">Paciente</span>
            </label>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {mensaje && (
          <p style={{ marginTop: "10px", color: messageType === 'success' ? 'green' : 'red' }}>
            {mensaje}
          </p>
        )}

        <p className="registro-texto">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            className="link-registro"
            onClick={() => {
              if (typeof onSwitchToLogin === "function") onSwitchToLogin();
            }}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default ModalRegister;
