const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Buscamos al usuario
    const result = await pool.query(
      'SELECT id, full_name, email, role, password FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // 2. COMPARACIÓN CRÍTICA
    // password: lo que escribió el usuario (ej: "admin123")
    // user.password: el hash guardado en la BD (ej: "$2b$10$...")
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 3. GENERACIÓN DEL TOKEN
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Limpieza por seguridad
    delete user.password;

    res.json({ 
      message: 'Login exitoso', 
      user,
      token 
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login };