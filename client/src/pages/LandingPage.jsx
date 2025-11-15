import "../assets/styles/LandingPage.css";
import BarraSesion from "../components/BarraSesion.jsx";
import DetallesSoftware from "../components/DetallesSoftware.jsx";
import ModalLogin from "../components/ModalLogin.jsx";
import ModalRegister from "../components/ModalRegister.jsx";
import { FaUsers, FaStar } from "react-icons/fa";
import SebasImg from '../assets/img/joe.png';
import CelaImg from '../assets/img/cela.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async ({ correo, contrasena }) => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Error al iniciar sesión');
        return;
      }

      const data = await res.json();
      // Save user info to localStorage so other components can read it
      try {
        if (data && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data && data.role) {
          localStorage.setItem('role', data.role);
        }
      } catch (e) {
        console.warn('No se pudo guardar el usuario en localStorage', e);
      }
      const role = data.role;
      // close modal and redirect based on role
      setOpenLogin(false);
      if (role === 'doctor') navigate('/Home');
      else navigate('/Home-P');
    } catch (err) {
      console.error('Login error', err);
      alert('Error de conexión al iniciar sesión');
    }
  };

  return (
    <div className="landing">
      <BarraSesion onOpenLogin={() => setOpenLogin(true)} onOpenRegister={() => setOpenRegister(true)} />

      <section id="inicio" className="hero">
        <div className="hero-content">
          <h1>Tecnología al servicio de la salud.</h1>
          <p>
            En Osler creemos que la tecnología puede salvar vidas. Por eso
            llevamos la inteligencia artificial al servicio de la salud, para
            anticipar riesgos, mejorar diagnósticos y construir un futuro más
            saludable para todos.
          </p>
          <a href="#servicios" className="btn-primary">Saber más</a>
        </div>
      </section>

      <section id="servicios" className="services">
        <DetallesSoftware/>
      </section>
      
       <section id="porque" className="porque">
        <h2>¿Por qué elegirnos?</h2>
        <p>
          En Osler creemos que la tecnología es poderosa, pero que su verdadero
          valor surge cuando está guiada por personas. Nuestro equipo está
          conformado por profesionales apasionados en salud y tecnología,
          comprometidos con diseñar soluciones que realmente marquen la
          diferencia. No solo desarrollamos software: trabajamos con empatía,
          conocimiento y dedicación para poner la inteligencia al servicio del
          bienestar humano.
        </p>

        <div className="testimonios">
          <div className="doctor-card">
            <img
              src={SebasImg}
              alt="Sebastian Diaz"
            />
            <h3>Sebastian Diaz</h3>
            <span>Cardiólogo</span>
            <div className="estrellas">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar style={{ opacity: 0.4 }} />
            </div>
            <p>
              Como especialista, valoro herramientas que realmente aporten a mi
              práctica; Osler me da precisión y confianza en cada consulta.
            </p>
          </div>

          <div className="doctor-card">
            <img
              src={CelaImg}
              alt="Nicolas Rivera"
            />
            <h3>Nicolas Rivera</h3>
            <span>Neurólogo</span>
            <div className="estrellas">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar style={{ opacity: 0.4 }} />
            </div>
            <p>
              Mi experiencia y criterio guían el tratamiento, pero con Osler
              tengo un soporte tecnológico que eleva la calidad de la atención.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Osler. Todos los derechos reservados.</p>
      </footer>
      {/* modals rendered at end */}
      <ModalLogin
        isOpen={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={() => { setOpenLogin(false); setOpenRegister(true); }}
        onLogin={handleLogin}
      />

      <ModalRegister
        isOpen={openRegister}
        onClose={() => setOpenRegister(false)}
        onSwitchToLogin={() => { setOpenRegister(false); setOpenLogin(true); }}
      />
    </div>
  );
};

export default LandingPage;


