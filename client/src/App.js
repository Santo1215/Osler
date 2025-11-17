import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import HomeD from "./components/HomeDoctor.jsx";
import EstadisticasMedicas from "./components/EstadisticasMedicas.jsx";
import PerfilUsuario from './components/PerfilUsuario.jsx';
import HorarioSemanal from './components/HorarioSemanal.jsx';
import CitasMedicas from './components/CitasMedicas.jsx';
import HomeP from './components/HomeP.jsx';
import CitasP from './components/CitasP.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<HomeD />} />
        <Route path="/Estadisticas" element={<EstadisticasMedicas />} />
        <Route path="/Perfil" element={<PerfilUsuario />} />
        <Route path="/Horario" element={<HorarioSemanal />} />
        <Route path="/Citas" element={<CitasMedicas />} />
        <Route path='/Home-P' element={<HomeP/>}/>
        <Route path='/Citas-P' element={<CitasP/>}/>
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
