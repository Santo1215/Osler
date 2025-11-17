import React, { useState, useEffect } from "react";


const PerfilCompletoFormP = ({ user, onSaved }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    genero: "",
    fecha_nacimiento: "",
    direccion: "",
    barrio: ""
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      console.log('Usuario recibido en formulario:', user);
      
      // Formatear la fecha si existe (de PostgreSQL a input date)
      let fechaFormateada = "";
      if (user.fecha_nacimiento) {
        const fecha = new Date(user.fecha_nacimiento);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        }
      }

      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        genero: user.genero || "",
        fecha_nacimiento: fechaFormateada,
        direccion: user.direccion || "",
        barrio: user.barrio || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Enviando datos:', formData);

      const response = await fetch(`http://localhost:5000/api/pacientes/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Perfil actualizado:', updatedUser);
        onSaved(updatedUser);
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert('Error al guardar: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil-completo-container">
      <div className="perfil-completo-card">
        <h2>Completa tu perfil</h2>
        <p>Para poder usar todos los servicios de Osler, necesitamos que completes tu información personal.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
              />
            </div>
            
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Tu número de teléfono"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Género *</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Tu dirección completa"
            />
          </div>

          <div className="form-group">
            <label>Barrio</label>
            <input
              type="text"
              name="barrio"
              value={formData.barrio}
              onChange={handleChange}
              placeholder="Tu barrio o sector"
            />
          </div>

          <button 
            type="submit" 
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerfilCompletoFormP;