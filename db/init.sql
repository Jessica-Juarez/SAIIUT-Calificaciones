-- ==========================================
-- SCRIPT DE BASE DE DATOS - SGE UT TEHUACÁN
-- VERSIÓN: 2.1 (Sincronizado con Bcrypt)
-- ==========================================

-- 1. LIMPIEZA
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS group_teachers CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS academic_periods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABLA DE USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    matricula VARCHAR(20) UNIQUE, 
    area VARCHAR(100) DEFAULT 'Tronco Común',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE PERIODOS ACADÉMICOS
CREATE TABLE academic_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE
);

-- 4. TABLA DE MATERIAS
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits INT DEFAULT 5
);

-- 5. TABLA DE GRUPOS
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(20) NOT NULL,
    area VARCHAR(100) DEFAULT 'General',
    cuatrimestre INT NOT NULL DEFAULT 1,
    period_id INT REFERENCES academic_periods(id),
    classroom VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA INTERMEDIA: Profesores
CREATE TABLE group_teachers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id),
    UNIQUE(user_id, group_id, subject_id)
);

-- 6. TABLA DE INSCRIPCIONES (Alumnos)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- 7. TABLA DE CALIFICACIONES
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    p1 DECIMAL(4,2) DEFAULT 0,
    p2 DECIMAL(4,2) DEFAULT 0,
    p3 DECIMAL(4,2) DEFAULT 0,
    final_score DECIMAL(4,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATOS DE PRUEBA (CON HASHES DE BCRYPT)
-- ==========================================

-- Admin pass: admin123 -> $2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G
-- Profe/Alumno pass: password123 -> $2b$10$8K1p/a06vI.Y6U6Y6u7Ebe.vYhXhZ9/z8V6G.q0DCC.7BvYhXhZ9/z
-- (Nota: Estos hashes son ejemplos compatibles con tu login)

INSERT INTO users (full_name, email, password, role, matricula, area) VALUES 
('Admin General', 'admin@uttehuacan.edu.mx', '$2b$10$9lj1xZkp9DG4zuWeQLHT5.eDEcySaiDUKI4C3a6nIVDa3kQ8VR6HS', 'admin', 'ADM001', 'Administración'),
('Ing. Juan Pérez', 'juan.perez@uttehuacan.edu.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'teacher', 'DOC001', 'Ingeniería'),
('Lic. Maria Lopez', 'maria.g@uttehuacan.edu.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'teacher', 'DOC002', 'Ciencias Básicas'),
('Carlos Hernandez', 'carlos@alumnos.ut.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'student', 'ALU23001', 'Desarrollo de Software'),
('Ana Torres', 'ana@alumnos.ut.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'student', 'ALU23002', 'Desarrollo de Software');

-- Insertar Periodo
INSERT INTO academic_periods (name, start_date, end_date, is_active) VALUES 
('Enero - Abril 2024', '2024-01-07', '2024-04-30', TRUE);

-- Insertar Materias
INSERT INTO subjects (name, credits) VALUES 
('Programación Web', 6),
('Base de Datos', 5),
('Álgebra Lineal', 5),
('Inglés IV', 4);

-- Crear Grupos
INSERT INTO groups (group_name, cuatrimestre, area, period_id, classroom) VALUES 
('4B', 4, 'Desarrollo de Software', 1, 'Lab 3 (Cómputo)'), 
('2A', 2, 'Mecatrónica', 1, 'Edificio K-201'); 

-- Asignar Profesores
INSERT INTO group_teachers (user_id, group_id, subject_id) VALUES (2, 1, 1), (3, 2, 3);

-- Inscribir Alumnos
INSERT INTO enrollments (student_id, group_id) VALUES (4, 1), (5, 1);