import React from "react";
import "../assets/styles/HomeDoctor.css";
import BarraLateral from "./BarraLateral";

const HomeD = () => {
  return (
    <div className="contenedor-home">
      <BarraLateral />

      <main className="contenido-principal">
        <h1>Hola, Dr. Jose Meneses</h1>

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
      </main>
    </div>
  );
};

export default HomeD;