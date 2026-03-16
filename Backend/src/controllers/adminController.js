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
  // Ajuste: Se agregó 'cuatrimestre' para que coincida con la BD
  const { name, cuatrimestre, subject_id, teacher_id, period_id, classroom } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO groups (name, cuatrimestre, subject_id, teacher_id, period_id, classroom) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, cuatrimestre, subject_id, teacher_id, period_id, classroom]
    );
    res.json({ message: 'Grupo creado exitosamente', group: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al asignar materia. Verifica duplicados.' });
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
  getAllUsers
};