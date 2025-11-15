import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor Osler funcionando correctamente');
});

// =====================================
//  PACIENTES
// =====================================
app.get('/api/pacientes', async (req, res) => {
  const result = await pool.query('SELECT * FROM pacientes');
  res.json(result.rows);
});

app.post('/api/pacientes', async (req, res) => {
  const { nombre, apellido, genero, fecha_nacimiento, direccion, telefono, email } = req.body;
  const result = await pool.query(
    'INSERT INTO pacientes (nombre, apellido, genero, fecha_nacimiento, direccion, telefono, email) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [nombre, apellido, genero, fecha_nacimiento, direccion, telefono, email]
  );
  res.json(result.rows[0]);
});

// Obtener un paciente por ID
app.get('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, genero, fecha_nacimiento, direccion, barrio, telefono, email, fecha_registro FROM pacientes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo paciente por ID:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar datos de un paciente (completar perfil)
app.put('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, genero, fecha_nacimiento, direccion, email, telefono } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pacientes SET nombre = $1, apellido = $2, genero = $3, fecha_nacimiento = $4, direccion = $5, email = $6, telefono = $7 WHERE id = $8 RETURNING id, nombre, apellido, email, genero, fecha_nacimiento, direccion, telefono',
      [nombre, apellido, genero, fecha_nacimiento, direccion, email, telefono, id]
    );
    if (result && result.rows && result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    return res.status(404).json({ message: 'Paciente no encontrado' });
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// =====================================
//  DOCTORES
// =====================================
app.get('/api/doctores', async (req, res) => {
  const result = await pool.query('SELECT * FROM doctores');
  res.json(result.rows);
});

// Actualizar datos de un doctor (completar perfil)
app.put('/api/doctores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, especialidad, descripcion, consultorio, email, telefono } = req.body;
  try {
    const result = await pool.query(
      'UPDATE doctores SET nombre = $1, apellido = $2, especialidad = $3, descripcion = $4, consultorio = $5, email = $6, telefono = $7 WHERE id = $8 RETURNING id, nombre, apellido, especialidad, descripcion, consultorio, email, telefono',
      [nombre, apellido, especialidad, descripcion, consultorio, email, telefono, id]
    );
    if (result && result.rows && result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    return res.status(404).json({ message: 'Doctor no encontrado' });
  } catch (error) {
    console.error('Error actualizando doctor:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// =====================================
//  CITAS
// =====================================
app.get('/api/citas', async (req, res) => {
  const result = await pool.query(`
    SELECT c.id,
           p.nombre AS paciente,
           d.nombre AS doctor,
           c.fecha_cita AS fecha,
           c.hora_cita AS hora,
           c.tipo_cita,
           c.estado
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN doctores d ON c.doctor_id = d.id
  `);
  res.json(result.rows);
});

app.post('/api/citas', async (req, res) => {
  const { id_paciente, id_doctor, fecha, hora, tipo_cita } = req.body;
  // Map to your DB columns: paciente_id, doctor_id, fecha_cita, hora_cita
  const result = await pool.query(
    'INSERT INTO citas (paciente_id, doctor_id, fecha_cita, hora_cita, tipo_cita) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id_paciente, id_doctor, fecha, hora, tipo_cita]
  );
  res.json(result.rows[0]);
});

// Obtener citas de un paciente específico
app.get('/api/citas-paciente/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.id,
             c.paciente_id AS id_paciente,
             c.doctor_id AS id_doctor,
             d.nombre AS doctor,
             c.fecha_cita AS fecha,
             c.hora_cita AS hora,
             c.tipo_cita,
             c.estado
      FROM citas c
      JOIN doctores d ON c.doctor_id = d.id
      WHERE c.paciente_id = $1
      ORDER BY c.fecha_cita DESC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo citas del paciente:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar una cita por ID
app.delete('/api/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM citas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita eliminada correctamente' });

  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// =====================================
//  HORARIOS
// =====================================
app.get('/api/horarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM horarios_doctor');
  res.json(result.rows);
});

// =====================================
//  ESTADÍSTICAS DEL DOCTOR
// =====================================
app.get('/api/estadisticas/:idDoctor', async (req, res) => {
  const { idDoctor } = req.params;
  const result = await pool.query('SELECT * FROM estadisticas_doctor WHERE id_doctor = $1', [idDoctor]);
  res.json(result.rows);
});

// =====================================
//  HISTORIAL MÉDICO
// =====================================
app.get('/api/historial/:idPaciente', async (req, res) => {
  const { idPaciente } = req.params;
  const result = await pool.query('SELECT * FROM historial_medico WHERE id_paciente = $1', [idPaciente]);
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// POST /api/registro
app.post('/api/registro', async (req, res) => {
  // Accept either 'password' or 'contraseña' from the client
  const { usuario, correo, rol } = req.body;
  const contraseña = req.body.password || req.body.contraseña || req.body.contrasena || '';

  try {
    if (rol === 'paciente') {
      // Insertando la contraseña en la columna `contraseña` (asegúrate de haber migrado la BD)
      await pool.query(
        'INSERT INTO pacientes (nombre, email, telefono, contraseña) VALUES ($1, $2, $3, $4)',
        [usuario, correo, 'No registrado', contraseña]
      );
    } else if (rol === 'doctor') {
      await pool.query(
        'INSERT INTO doctores (nombre, especialidad, email, telefono, contraseña) VALUES ($1, $2, $3, $4, $5)',
        [usuario, 'General', correo, 'No registrado', contraseña]
      );
    }

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { correo } = req.body;
  // Accept contraseña (tilde) or contrasena (no tilde) or password
  const contraseña = (req.body.contraseña || req.body.contrasena || req.body.password || '').toString();

  try {
    // Buscar en doctores e intentar validar contraseña (columna `contraseña`)
    const doc = await pool.query('SELECT id, nombre, email, contraseña FROM doctores WHERE email = $1', [correo]);
    if (doc && doc.rows && doc.rows.length > 0) {
      const row = doc.rows[0];
      // Trim both sides to avoid accidental whitespace mismatches
      const provided = contraseña.trim();
      const stored = (row.contraseña || '').toString().trim();
      console.debug('Login attempt for', correo, 'provided length', provided.length, 'stored length', stored.length);
      if (!stored) {
        return res.status(400).json({ message: 'El usuario doctor no tiene contraseña configurada en la base de datos' });
      }
      if (provided === stored) {
        return res.json({ role: 'doctor', user: { id: row.id, nombre: row.nombre, email: row.email } });
      }
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Buscar en pacientes
    const pac = await pool.query('SELECT id, nombre, email, contraseña FROM pacientes WHERE email = $1', [correo]);
    if (pac && pac.rows && pac.rows.length > 0) {
      const row = pac.rows[0];
      const provided = contraseña.trim();
      const stored = (row.contraseña || '').toString().trim();
      console.debug('Login attempt for', correo, 'provided length', provided.length, 'stored length', stored.length);
      if (!stored) {
        return res.status(400).json({ message: 'El usuario paciente no tiene contraseña configurada en la base de datos' });
      }
      if (provided === stored) {
        return res.json({ role: 'paciente', user: { id: row.id, nombre: row.nombre, email: row.email } });
      }
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});
