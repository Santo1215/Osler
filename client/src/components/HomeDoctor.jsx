import React, { useState, useEffect } from "react";
import "../assets/styles/HomeDoctor.css";
import BarraLateral from "./BarraLateral";
import PerfilCompletoForm from "./PerfilCompletoForm";

const HomeD = () => {
  const [user, setUser] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const obj = JSON.parse(raw);
        setUser(obj);
        setNeedsProfile(!isProfileComplete(obj));
      } else {
        setUser(null);
        setNeedsProfile(true);
      }
    } catch (e) {
      setUser(null);
      setNeedsProfile(true);
    }
  }, []);

  const isProfileComplete = (u) => {
    if (!u) return false;
    // Required fields in server.js for doctores: nombre, especialidad, email, telefono, contraseña
    const nombre = u.nombre || u.name || '';
    const apellido = u.apellido || '';
    const especialidad = u.especialidad || '';
    const descripcion = u.descripcion || '';
    const consultorio = u.consultorio || '';
    const email = u.email || '';
    const telefono = u.telefono || u.phone || '';
    return [nombre, apellido, especialidad, descripcion, consultorio, email, telefono].every((s) => typeof s === 'string' && s.trim().length > 0);
  };

  const handleSaved = (updatedUser) => {
    // Save to localStorage and reload to ensure all components reflect the update
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('No se pudo actualizar localStorage', e);
    }
    // Simple approach: reload page so BarraLateral and other components pick up changes
    window.location.reload();
  };

  return (
    <div className="contenedor-home">
      <BarraLateral />

      <main className="contenido-principal">
        {needsProfile ? (
          <PerfilCompletoForm user={user} onSaved={handleSaved} />
        ) : (
          <>
            <h1>Hola, Dr. {user && ((user.nombre || user.name || '') + (user.apellido ? ' ' + user.apellido : ''))}</h1>

            <div className="contenedor-cajas">
              <div className="caja citas">
                <h2>Citas</h2>
                <p>Hoy tiene 3 citas:</p>
                <table>
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Mateo Delgado</td><td>8:00 AM</td></tr>
                    <tr><td>Daniel Sandoval</td><td>11:00 AM</td></tr>
                    <tr><td>Esteban Suarez</td><td>3:00 PM</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="caja estadisticas">
                <h2>Estadísticas</h2>
                <p>Cirugías realizadas en la última semana:</p>
                <table>
                  <thead>
                    <tr><th>Cirugía</th><th>Cantidad</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Colecistectomías</td><td>4</td></tr>
                    <tr><td>Hernias</td><td>3</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomeD;
