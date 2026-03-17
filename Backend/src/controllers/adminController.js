const pool = require('../config/db');
const bcrypt = require('bcrypt'); // ¡No olvides hacer: npm install bcrypt!

// --- FUNCIONES EXISTENTES ---

const getTeachers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, full_name, matricula, area FROM users WHERE role = 'teacher'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignGroup = async (req, res) => {
  // 1. Extraemos los nombres EXACTOS que envía el Frontend (GroupManagement.jsx)
  const { group_name, cuatrimestre, area, classroom } = req.body;

  try {
    // 2. Asegúrate de que las columnas coincidan con tu tabla 'groups'
    const result = await pool.query(
      `INSERT INTO groups (group_name, cuatrimestre, area, classroom) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [group_name, cuatrimestre, area, classroom]
    );

    res.json({ 
      message: 'Grupo creado exitosamente', 
      group: result.rows[0] 
    });
  } catch (err) {
    console.error("Detalle del error en BD:", err); // Esto te ayudará a ver el error real en la consola
    res.status(500).json({ 
      error: 'Error al crear el grupo.',
      details: err.message 
    });
  }
};

const createUser = async (req, res) => {
  // Ajuste: Se agregó 'area'
  const { full_name, email, password, role, matricula, area } = req.body;
  
  // Validamos que el rol sea correcto
  if (!['teacher', 'student'].includes(role)) {
    return res.status(400).json({ error: 'El rol debe ser teacher o student' });
  }

  try {
    // Encriptamos la contraseña para mayor seguridad
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role, matricula, area) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, role, area`,
      [full_name, email, hashedPassword, role, matricula, area]
    );
    res.json({ message: 'Usuario creado exitosamente', user: result.rows[0] });
  } catch (err) {
    // Código 23505 es error de duplicados en Postgres (ej: email repetido)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El correo o matrícula ya existen.' });
    }
    res.status(500).json({ error: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // 1. Contar Alumnos
    const studentsCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    
    // 2. Contar Profesores
    const teachersCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'teacher'");
    
    // 3. Contar Grupos Activos
    const groupsCount = await pool.query("SELECT COUNT(*) FROM groups");

    // 4. Datos de Reprobación
    const gradesStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE final_score >= 8) as aprobados,
        COUNT(*) FILTER (WHERE final_score < 8) as reprobados
      FROM grades
    `);

    // 5. Alumnos por Área
    const areaStats = await pool.query(`
      SELECT area, COUNT(*) as cantidad 
      FROM users WHERE role = 'student' 
      GROUP BY area
    `);

    res.json({
      students: parseInt(studentsCount.rows[0].count),
      teachers: parseInt(teachersCount.rows[0].count),
      groups: parseInt(groupsCount.rows[0].count),
      aprobados: parseInt(gradesStats.rows[0].aprobados || 0),
      reprobados: parseInt(gradesStats.rows[0].reprobados || 0),
      areas: areaStats.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- NUEVAS FUNCIONES ---

const getStudents = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, full_name, email, role, matricula, area, created_at FROM users WHERE role = 'student' ORDER BY full_name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, area } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), area = COALESCE($2, area) 
       WHERE id = $3 RETURNING id, full_name, email, role, matricula, area`,
      [full_name, area, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario actualizado', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar. Asegúrate de que no tenga calificaciones o grupos asignados.' });
  }
};

const getPeriods = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM academic_periods ORDER BY start_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const enrollStudent = async (req, res) => {
  const { student_id, group_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO enrollments (student_id, group_id) VALUES ($1, $2) RETURNING *',
      [student_id, group_id]
    );
    res.json({ message: 'Alumno inscrito exitosamente', enrollment: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El alumno ya está inscrito en este grupo.' });
    }
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Traemos a todos ordenados por Rol y luego por Nombre
    const result = await pool.query(`
      SELECT id, full_name, email, role, matricula, area 
      FROM users 
      ORDER BY role ASC, full_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// --- ASIGNAR ALUMNO (1 alumno -> 1 grupo) ---
//const assignStudent = async (req, res) => {
  //const { userId, groupId } = req.body;
  //try {
   // await pool.query(`
    //  INSERT INTO enrollments (student_id, group_id)
     // VALUES ($1, $2)
     // ON CONFLICT (student_id) 
      //DO UPDATE SET group_id = EXCLUDED.group_id
    //`, [userId, groupId]);
   // res.json({ message: "Alumno asignado/movido con éxito" });
//  } catch (err) {
//    res.status(500).json({ error: "Error al asignar alumno" });
//  }
//};

// --- ASIGNAR ALUMNO (1 alumno -> N grupos, pero sin repetir el mismo) ---
const assignStudent = async (req, res) => {
  const { userId, groupId } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO enrollments (student_id, group_id)
      VALUES ($1, $2)
      ON CONFLICT (student_id, group_id) DO NOTHING
      RETURNING *
    `, [userId, groupId]);
    
    // Si no insertó nada (rowCount es 0), significa que ya estaba en ese grupo
    if (result.rowCount === 0) {
      return res.status(400).json({ error: "El alumno ya está inscrito en este grupo." });
    }

    res.json({ message: "Alumno asignado con éxito al nuevo grupo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al asignar alumno" });
  }
};

// --- ASIGNAR PROFESOR (1 profesor -> 1 grupo -> 1 materia) ---
const assignTeacher = async (req, res) => {
  const { userId, groupId, subjectId } = req.body; // ¡Añadimos subjectId!

  try {
    // Validamos que lleguen los 3 datos
    if (!userId || !groupId || !subjectId) {
      return res.status(400).json({ error: "Faltan datos (Profesor, Grupo o Materia)" });
    }

    // Insertamos usando las 3 columnas
    const result = await pool.query(`
      INSERT INTO group_teachers (user_id, group_id, subject_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, group_id, subject_id) DO NOTHING
      RETURNING *
    `, [userId, groupId, subjectId]);

    // Si no insertó nada, es porque esa combinación exacta ya existe
    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Este profesor ya imparte esta materia en este grupo" });
    }

    res.json({ message: "Profesor vinculado a la materia y grupo exitosamente" });
  } catch (err) {
    console.error("Error en assignTeacher:", err.message);
    res.status(500).json({ error: "Error en el servidor al vincular profesor" });
  }
};

// --- CREAR GRUPO (similar a assignGroup pero con endpoint separado) ---
const createGroup = async (req, res) => {
  const { group_name, cuatrimestre, area, classroom } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO groups (group_name, cuatrimestre, area, period_id, classroom) 
       VALUES ($1, $2, $3, (SELECT id FROM academic_periods WHERE is_active = true LIMIT 1), $4) 
       RETURNING *`,
      [group_name, cuatrimestre, area, classroom]
    );
    res.json({ message: 'Grupo creado', group: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};
// Obtener todos los grupos
const getGroups = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY group_name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener grupos" });
  }
};

// Exportar TODO
module.exports = { 
  getTeachers, 
  getSubjects, 
  assignGroup, 
  createUser, 
  getDashboardStats,
  getStudents,
  updateUser,
  deleteUser,
  getPeriods,
  enrollStudent,
  getAllUsers,
  assignStudent,
  assignTeacher,
  createGroup,
  getGroups
};