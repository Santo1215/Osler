import React, { useState, useEffect } from 'react';

const PerfilCompletoFormP = ({ user, onSaved }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    genero: '',
    fecha_nacimiento: '',
    direccion: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        nombre: user.nombre || user.name || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || user.phone || '',
        genero: user.genero || '',
        fecha_nacimiento: user.fecha_nacimiento || '',
        direccion: user.direccion || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const id = user && user.id;
      if (!id) throw new Error('No se encontró el id del usuario');

      const res = await fetch(`http://localhost:5000/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error actualizando datos');
      }
      const updated = await res.json();
      // Save updated user to localStorage
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage', e);
      }
      if (onSaved) onSaved(updated);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="perfil-form">
      <h2>Completa tu perfil</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>

        <div>
          <label>Apellido</label>
          <input name="apellido" value={form.apellido} onChange={handleChange} required />
        </div>

        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" required />
        </div>

        <div>
          <label>Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} required />
        </div>

        <div>
          <label>Género</label>
          <select name="genero" value={form.genero} onChange={handleChange} required>
            <option value="">Selecciona un género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label>Fecha de Nacimiento</label>
          <input name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" required />
        </div>

        <div>
          <label>Dirección</label>
          <input name="direccion" value={form.direccion} onChange={handleChange} required />
        </div>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</button>
        </div>
      </form>
    </div>
  );
};

export default PerfilCompletoFormP;
