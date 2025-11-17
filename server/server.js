import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db.js';
import dotenv from 'dotenv';
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// CONFIGURAR DOTENV PRIMERO
dotenv.config();

const app = express();

// Middleware básico PRIMERO
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })
);

// Agrega esto ANTES de las rutas de passport
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// SESIONES después de cors
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  })
);

// PASSPORT después de sesiones
app.use(passport.initialize());
app.use(passport.session());

// DEBUG: Verificar variables de entorno
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Faltante');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Faltante');
console.log('Google Callback URL:', process.env.GOOGLE_CALLBACK_URL);

// SERIALIZAR usuario
passport.serializeUser((user, done) => {
  console.log('Serializando usuario:', user);
  done(null, user);
});

// DESERIALIZAR usuario
passport.deserializeUser((obj, done) => {
  console.log('Deserializando usuario:', obj);
  done(null, obj);
});

// --- STRATEGIA GOOGLE SIMPLIFICADA ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile recibido:', profile);
        const email = profile.emails[0].value;
        const nombre = profile.displayName;

        console.log('Buscando usuario con email:', email);

        // 1) Buscar si es doctor
        const doctor = await pool.query(
          "SELECT * FROM doctores WHERE email = $1",
          [email]
        );

        if (doctor.rows.length > 0) {
          return done(null, {
            role: "doctor",
            id: doctor.rows[0].id,
            nombre: doctor.rows[0].nombre || nombre,
            email,
          });
        }

        // 2) Buscar si es paciente
        const paciente = await pool.query(
          "SELECT * FROM pacientes WHERE email = $1",
          [email]
        );

        if (paciente.rows.length > 0) {
          return done(null, {
            role: "paciente",
            id: paciente.rows[0].id,
            nombre: paciente.rows[0].nombre || nombre,
            email,
          });
        }

        return done(null, false, { message: "Usuario no registrado en el sistema" });

      } catch (err) {
        console.error('Error en Google Strategy:', err);
        done(err, null);
      }
    }
  )
);

// Agrega esta ruta en server.js
app.get("/api/auth/current-user", async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user) {
      // Traer datos frescos de la base de datos
      const userId = req.user.id;
      const role = req.user.role;
      
      let userData;
      if (role === "doctor") {
        const result = await pool.query('SELECT * FROM doctores WHERE id = $1', [userId]);
        userData = result.rows[0];
      } else if (role === "paciente") {
        const result = await pool.query('SELECT * FROM pacientes WHERE id = $1', [userId]);
        userData = result.rows[0];
      }
      
      if (userData) {
        res.json({
          role: role,
          id: userData.id,
          nombre: userData.nombre,
          email: userData.email,
          // Incluir otros campos según sea necesario
          ...userData
        });
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } else {
      res.status(401).json({ error: "No autenticado" });
    }
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// --- LOGIN CON GOOGLE ---
app.get(
  "/auth/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account" // Forzar selección de cuenta
  })
);

// --- CALLBACK SIMPLIFICADO ---
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?error=auth_failed",
    failureMessage: true
  }),
  async (req, res) => {
    try {
      console.log('Callback exitoso, usuario:', req.user);
      
      if (!req.user) {
        return res.redirect("http://localhost:3000/login?error=no_user");
      }

      // SIMPLEMENTE redirigir según el rol - el frontend ya sabrá qué hacer
      if (req.user.role === "doctor") {
        res.redirect("http://localhost:3000/Home");
      } else if (req.user.role === "paciente") {
        res.redirect("http://localhost:3000/Home-P");
      } else {
        res.redirect("http://localhost:3000/login?error=invalid_role");
      }

    } catch (err) {
      console.error('Error en callback:', err);
      res.redirect("http://localhost:3000/login?error=server_error");
    }
  }
);
// Ruta para verificar la sesión (útil para debug)
app.get('/auth/status', (req, res) => {
  res.json({ 
    isAuthenticated: req.isAuthenticated(), 
    user: req.user 
  });
});

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
  const { nombre, apellido, genero, fecha_nacimiento, direccion, email, telefono, barrio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pacientes 
       SET nombre = $1, apellido = $2, genero = $3, fecha_nacimiento = $4,
           direccion = $5, email = $6, telefono = $7, barrio = $8
       WHERE id = $9
       RETURNING id, nombre, apellido, genero, fecha_nacimiento, direccion, email, telefono, barrio`,
      [nombre, apellido, genero, fecha_nacimiento, direccion, email, telefono, barrio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


// =====================================
//  DOCTORES
// =====================================
app.get('/api/doctores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM doctores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo doctor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
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

// Obtener citas de un doctor por ID
app.get('/api/doctores/:id/citas', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.hora_cita, c.fecha_cita, c.estado, c.paciente_id, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido
       FROM citas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.doctor_id = $1
       ORDER BY c.fecha_cita, c.hora_cita`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo citas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// GET /api/pacientes/:id/completo
app.get("/api/pacientes/:id/completo", async (req, res) => {
  try {
    const { id } = req.params;

    // Datos del paciente
    const paciente = await pool.query(`
      SELECT * FROM pacientes WHERE id = $1
    `, [id]);

    if (paciente.rowCount === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Historial
    const historial = await pool.query(`
      SELECT * FROM historial_medico WHERE paciente_id = $1 ORDER BY fecha_registro DESC
    `, [id]);

    // Cirugías
    const cirugias = await pool.query(`
      SELECT * FROM cirugias WHERE paciente_id = $1 ORDER BY fecha DESC
    `, [id]);

    // Cita más reciente o pendiente
    const cita = await pool.query(`
      SELECT * FROM citas WHERE paciente_id = $1 ORDER BY fecha_cita DESC LIMIT 1
    `, [id]);

    res.json({
      paciente: paciente.rows[0],
      historial: historial.rows,
      cirugias: cirugias.rows,
      cita: cita.rows[0] || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando datos del paciente" });
  }
});


app.post("/cirugias", async (req, res) => {
  try {
    const { doctor_id, paciente_id, fecha, tipo, complejidad, duracion_horas, complicaciones, descripcion } = req.body;

    const r = await pool.query(`
      INSERT INTO cirugias
      (doctor_id, paciente_id, fecha, tipo, complejidad, duracion_horas, complicaciones, descripcion)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [doctor_id, paciente_id, fecha, tipo, complejidad, duracion_horas, complicaciones, descripcion]);

    res.json(r.rows[0]);

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Error registrando cirugía" });
  }
});
// Ruta de diagnóstico - agregar esto temporalmente
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Rutas registradas directamente
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Rutas de router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Rutas disponibles en el servidor',
    totalRoutes: routes.length,
    routes: routes
  });
});

// =====================================
//  HORARIOS DOCTORES - CRUD COMPLETO
// =====================================

// Obtener todos los horarios de un doctor específico
app.get('/api/doctores/:id/horarios', async (req, res) => {
  const { id } = req.params;
  console.log(`📅 Solicitando horarios para doctor ID: ${id}`);

  try {
    const result = await pool.query(
      `SELECT * FROM horarios_doctores 
       WHERE doctor_id = $1 
       ORDER BY 
         CASE dia_semana
           WHEN 'Lunes' THEN 1
           WHEN 'Martes' THEN 2
           WHEN 'Miércoles' THEN 3
           WHEN 'Miercoles' THEN 3
           WHEN 'Jueves' THEN 4
           WHEN 'Viernes' THEN 5
           WHEN 'Sábado' THEN 6
           WHEN 'Sabado' THEN 6
           WHEN 'Domingo' THEN 7
         END,
         hora_inicio`,
      [id]
    );

    console.log(`✅ Horarios encontrados: ${result.rows.length} para doctor ${id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error obteniendo horarios del doctor:', error);
    res.status(500).json({ message: 'Error del servidor al obtener horarios' });
  }
});

// Crear un nuevo horario para un doctor
app.post('/api/doctores/:id/horarios', async (req, res) => {
  const { id } = req.params;
  const { 
    dia_semana, 
    hora_inicio, 
    hora_fin, 
    actividad, 
    color = '#87CEFA', 
    observaciones 
  } = req.body;

  console.log('➕ Creando horario:', { id, dia_semana, hora_inicio, hora_fin, actividad });

  try {
    // Validar que las horas sean correctas
    if (hora_fin <= hora_inicio) {
      return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio' });
    }

    const result = await pool.query(
      `INSERT INTO horarios_doctores 
       (doctor_id, dia_semana, hora_inicio, hora_fin, actividad, color, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [id, dia_semana, hora_inicio, hora_fin, actividad, color, observaciones]
    );

    console.log('✅ Horario creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando horario:', error);
    
    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({ message: 'Datos de horario inválidos' });
    }
    
    res.status(500).json({ message: 'Error del servidor al crear horario' });
  }
});

// Actualizar un horario existente
app.put('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    dia_semana, 
    hora_inicio, 
    hora_fin, 
    actividad, 
    color, 
    observaciones 
  } = req.body;

  console.log('✏️ Actualizando horario ID:', id);

  try {
    // Validar que las horas sean correctas
    if (hora_fin <= hora_inicio) {
      return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio' });
    }

    const result = await pool.query(
      `UPDATE horarios_doctores 
       SET dia_semana = $1, hora_inicio = $2, hora_fin = $3, 
           actividad = $4, color = $5, observaciones = $6,
           fecha_actualizacion = NOW()
       WHERE id = $7 
       RETURNING *`,
      [dia_semana, hora_inicio, hora_fin, actividad, color, observaciones, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    console.log('✅ Horario actualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando horario:', error);
    
    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({ message: 'Datos de horario inválidos' });
    }
    
    res.status(500).json({ message: 'Error del servidor al actualizar horario' });
  }
});

// Eliminar un horario
app.delete('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  console.log('🗑️ Eliminando horario ID:', id);

  try {
    const result = await pool.query(
      'DELETE FROM horarios_doctores WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    console.log('✅ Horario eliminado:', result.rows[0]);
    res.json({ message: 'Horario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando horario:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar horario' });
  }
});

//  ESTADÍSTICAS DEL DOCTOR
// Función para calcular estadísticas semanales
// ===========================
const calcularEstadisticasSemana = async (doctorId, fechaInicio, fechaFin) => {
  try {
    const citasRes = await pool.query(
      `SELECT *
       FROM citas
       WHERE doctor_id = $1
         AND fecha_cita BETWEEN $2 AND $3`,
      [doctorId, fechaInicio, fechaFin]
    );

    const citas = citasRes.rows;

    let totalPacientes = 0;
    let totalCirugias = 0;
    let complicaciones = 0;
    let duracionConsultas = 0;
    let pacientesMasculinos = 0;
    let pacientesFemeninos = 0;
    let pacientesOtro = 0;
    let cirugiasBaja = 0;
    let cirugiasMedia = 0;
    let cirugiasAlta = 0;
    let enfermedadesMap = {};

    citas.forEach(cita => {
      totalPacientes++;
      duracionConsultas += cita.duracion || 0;

      // Género
      if (cita.genero === "Masculino") pacientesMasculinos++;
      else if (cita.genero === "Femenino") pacientesFemeninos++;
      else pacientesOtro++;

      // Cirugías
      if (cita.cirugia) {
        totalCirugias++;
        if (cita.cirugia.complejidad === "Baja") cirugiasBaja++;
        else if (cita.cirugia.complejidad === "Media") cirugiasMedia++;
        else if (cita.cirugia.complejidad === "Alta") cirugiasAlta++;

        if (cita.cirugia.complicacion) complicaciones++;
      }

      // Enfermedades
      if (cita.diagnostico) {
        if (!enfermedadesMap[cita.diagnostico]) enfermedadesMap[cita.diagnostico] = 0;
        enfermedadesMap[cita.diagnostico]++;
      }
    });

    const enfermedadesComunes = Object.entries(enfermedadesMap).map(([name, count]) => ({ name, count }));

    // Insertar o actualizar registro
    await pool.query(
      `INSERT INTO estadisticas_doctores(
        doctor_id, total_pacientes_atendidos, total_cirugias, tasa_complicaciones, duracion_promedio_consulta,
        pacientes_masculinos, pacientes_femeninos, pacientes_otro,
        cirugias_baja_complejidad, cirugias_media_complejidad, cirugias_alta_complejidad,
        enfermedades_comunes, fecha_actualizacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
      ON CONFLICT (doctor_id) DO UPDATE SET
        total_pacientes_atendidos=$2,
        total_cirugias=$3,
        tasa_complicaciones=$4,
        duracion_promedio_consulta=$5,
        pacientes_masculinos=$6,
        pacientes_femeninos=$7,
        pacientes_otro=$8,
        cirugias_baja_complejidad=$9,
        cirugias_media_complejidad=$10,
        cirugias_alta_complejidad=$11,
        enfermedades_comunes=$12,
        fecha_actualizacion=NOW()`,
      [
        doctorId,
        totalPacientes,
        totalCirugias,
        totalCirugias > 0 ? (complicaciones / totalCirugias) * 100 : 0,
        totalPacientes > 0 ? duracionConsultas / totalPacientes : 0,
        pacientesMasculinos,
        pacientesFemeninos,
        pacientesOtro,
        cirugiasBaja,
        cirugiasMedia,
        cirugiasAlta,
        JSON.stringify(enfermedadesComunes),
      ]
    );

  } catch (err) {
    console.error("Error en calcularEstadisticasSemana:", err);
  }
};

// ===========================
// Endpoint: estadísticas semanales
// ===========================
app.get("/api/doctores/:id/estadisticas/semanal", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "DoctorId requerido" });

  try {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaFin.getDate() - 7);

    await calcularEstadisticasSemana(id, fechaInicio.toISOString(), fechaFin.toISOString());

    const result = await pool.query("SELECT * FROM estadisticas_doctores WHERE doctor_id=$1", [id]);

    if (result.rows.length === 0) {
      return res.json({
        total_pacientes_atendidos: 0,
        pacientes_masculinos: 0,
        pacientes_femeninos: 0,
        pacientes_otro: 0,
        total_cirugias: 0,
        tasa_complicaciones: 0,
        duracion_promedio_consulta: 0,
        cirugias_baja_complejidad: 0,
        cirugias_media_complejidad: 0,
        cirugias_alta_complejidad: 0,
        enfermedades_comunes: [],
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

app.put("/api/doctores/:id/estadisticas", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nuevaConsulta = false,
      nuevaCirugia = null, // { complejidad: "Baja"|"Media"|"Alta", duracion_horas: number, complicacion: true|false }
      generoPaciente = null, // "Masculino", "Femenino", "Otro"
      duracionConsulta = 0, // minutos
      enfermedad = null // nombre de la enfermedad para contar
    } = req.body;

    // Crear registro si no existe
    await pool.query(`
      INSERT INTO estadisticas_doctores(doctor_id)
      VALUES ($1)
      ON CONFLICT (doctor_id) DO NOTHING
    `, [id]);

    // Actualizar métricas generales
    let updateQuery = `
      UPDATE estadisticas_doctores SET
        total_pacientes_atendidos = total_pacientes_atendidos + $1,
        total_cirugias = total_cirugias + $2,
        tasa_complicaciones = CASE 
          WHEN total_cirugias + $2 = 0 THEN 0
          ELSE ((tasa_complicaciones * total_cirugias) + $3)::NUMERIC / (total_cirugias + $2)
        END,
        duracion_promedio_consulta = CASE
          WHEN total_pacientes_atendidos + $1 = 0 THEN 0
          ELSE ((duracion_promedio_consulta * total_pacientes_atendidos) + $4) / (total_pacientes_atendidos + $1)
        END,
        duracion_promedio_cirugia = CASE
          WHEN total_cirugias + $2 = 0 THEN 0
          ELSE ((duracion_promedio_cirugia * total_cirugias) + $5) / (total_cirugias + $2)
        END,
        pacientes_masculinos = pacientes_masculinos + CASE WHEN $6='Masculino' THEN 1 ELSE 0 END,
        pacientes_femeninos = pacientes_femeninos + CASE WHEN $6='Femenino' THEN 1 ELSE 0 END,
        pacientes_otro = pacientes_otro + CASE WHEN $6='Otro' THEN 1 ELSE 0 END,
        cirugias_baja_complejidad = cirugias_baja_complejidad + CASE WHEN $7='Baja' THEN 1 ELSE 0 END,
        cirugias_media_complejidad = cirugias_media_complejidad + CASE WHEN $7='Media' THEN 1 ELSE 0 END,
        cirugias_alta_complejidad = cirugias_alta_complejidad + CASE WHEN $7='Alta' THEN 1 ELSE 0 END,
        enfermedades_comunes = CASE
          WHEN $8 IS NOT NULL THEN
            COALESCE(
              (
                SELECT jsonb_agg(
                  CASE 
                    WHEN e->>'name' = $8 THEN jsonb_build_object('name',$8,'count',(e->>'count')::int + 1)
                    ELSE e
                  END
                )
                FROM jsonb_array_elements(enfermedades_comunes) e
              ),
              jsonb_build_array(jsonb_build_object('name',$8,'count',1))
            )
          ELSE enfermedades_comunes
        END,
        fecha_actualizacion = now()
      WHERE doctor_id = $9
    `;

    await pool.query(updateQuery, [
      nuevaConsulta ? 1 : 0,
      nuevaCirugia ? 1 : 0,
      nuevaCirugia && nuevaCirugia.complicacion ? 1 : 0,
      duracionConsulta,
      nuevaCirugia ? nuevaCirugia.duracion_horas : 0,
      generoPaciente,
      nuevaCirugia ? nuevaCirugia.complejidad : null,
      enfermedad,
      id
    ]);

    res.json({ message: "Estadísticas actualizadas" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando estadísticas del doctor" });
  }
});


// =====================================
//  HISTORIAL MÉDICO
// =====================================
app.get('/api/historial/:idPaciente', async (req, res) => {
  const { idPaciente } = req.params;
  const result = await pool.query('SELECT * FROM historial_medico WHERE id_paciente = $1', [idPaciente]);
  res.json(result.rows);
});

// Crear un nuevo registro de historial
app.post('/api/historial', async (req, res) => {
  const {
    paciente_id,
    doctor_id,
    diagnostico,
    tratamiento,
    observaciones,
    antecedentes_patologicos,
    antecedentes_no_patologicos,
    antecedentes_familiares,
    alergias,
    inmunizaciones,
    salud_sexual
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO historial_medico (
        paciente_id,
        doctor_id,
        diagnostico,
        tratamiento,
        observaciones,
        antecedentes_patologicos,
        antecedentes_no_patologicos,
        antecedentes_familiares,
        alergias,
        inmunizaciones,
        salud_sexual,
        fecha_registro
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      RETURNING *
    `, [
      paciente_id,
      doctor_id,
      diagnostico,
      tratamiento,
      observaciones,
      antecedentes_patologicos,
      antecedentes_no_patologicos,
      antecedentes_familiares,
      alergias,
      inmunizaciones,
      salud_sexual
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando historial" });
  }
});

// Cambiar estado de la cita
app.put('/api/citas/:id/finalizar', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      "UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando la cita" });
  }
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
