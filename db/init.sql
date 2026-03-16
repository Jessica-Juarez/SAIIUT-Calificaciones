-- ==========================================
-- SCRIPT DE BASE DE DATOS - SGE UT TEHUACÁN
-- VERSIÓN: 2.0 (Con Áreas y Cuatrimestres)
-- ==========================================

-- 1. LIMPIEZA (Orden inverso para evitar errores de llaves foráneas)
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS academic_periods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABLA DE USUARIOS
-- Se agregó 'area' para saber la carrera del alumno
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    matricula VARCHAR(20) UNIQUE, 
    area VARCHAR(100) DEFAULT 'Tronco Común', -- Ej: "Desarrollo de Software", "Mecatrónica"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE PERIODOS ACADÉMICOS
CREATE TABLE academic_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Ej: "Enero - Abril 2024"
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
-- Se agregó 'cuatrimestre' para saber el grado
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- Ej: "A", "B" (La letra del grupo)
    cuatrimestre INT NOT NULL DEFAULT 1, -- Ej: 1, 4, 7, 10
    subject_id INT REFERENCES subjects(id),
    teacher_id INT REFERENCES users(id),
    period_id INT REFERENCES academic_periods(id),
    classroom VARCHAR(20), -- Ej: "Lab 3", "K-102"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE INSCRIPCIONES
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id),
    group_id INT REFERENCES groups(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, group_id)
);

-- 7. TABLA DE CALIFICACIONES
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    p1 DECIMAL(4,2), -- Parcial 1
    p2 DECIMAL(4,2), -- Parcial 2
    p3 DECIMAL(4,2), -- Parcial 3
    final_score DECIMAL(4,2), -- Promedio Final
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATOS DE PRUEBA (SEED DATA)
-- ==========================================

-- A. Insertar Usuarios (Admin, Profes, Alumnos de diferentes áreas)
INSERT INTO users (full_name, email, password, role, matricula, area) VALUES 
('Admin General', 'admin@uttehuacan.edu.mx', 'admin123', 'admin', 'ADM001', 'Administración'),
('Ing. Juan Pérez', 'juan.perez@uttehuacan.edu.mx', 'profe123', 'teacher', 'DOC001', 'Ingeniería'),
('Lic. Maria Lopez', 'maria.g@uttehuacan.edu.mx', 'profe123', 'teacher', 'DOC002', 'Ciencias Básicas'),
('Carlos Hernandez', 'carlos@alumnos.ut.mx', 'alumno123', 'student', 'ALU23001', 'Desarrollo de Software'),
('Ana Torres', 'ana@alumnos.ut.mx', 'alumno123', 'student', 'ALU23002', 'Desarrollo de Software'),
('Luis Ramirez', 'luis@alumnos.ut.mx', 'alumno123', 'student', 'ALU23003', 'Mecatrónica'),
('Sofia Mendez', 'sofia@alumnos.ut.mx', 'alumno123', 'student', 'ALU23004', 'Mecatrónica');

-- B. Insertar Periodo
INSERT INTO academic_periods (name, start_date, end_date, is_active) VALUES 
('Enero - Abril 2024', '2024-01-07', '2024-04-30', TRUE);

-- C. Insertar Materias
INSERT INTO subjects (name, credits) VALUES 
('Programación Web', 6),
('Base de Datos', 5),
('Álgebra Lineal', 5),
('Inglés IV', 4);

-- D. Crear Grupos (Con Cuatrimestre y Aula)
-- El Profe Juan da Programación Web a los de 4to Cuatrimestre en el Lab 3
INSERT INTO groups (name, cuatrimestre, subject_id, teacher_id, period_id, classroom) VALUES 
('4B', 4, 1, 2, 1, 'Lab 3 (Cómputo)'), 
('2A', 2, 3, 3, 1, 'Edificio K-201'); 

-- E. Inscribir Alumnos
-- Carlos y Ana van a Programación Web (Grupo 4B)
INSERT INTO enrollments (student_id, group_id) VALUES (4, 1), (5, 1);
-- Luis y Sofia van a Álgebra (Grupo 2A)
INSERT INTO enrollments (student_id, group_id) VALUES (6, 2), (7, 2);

-- F. Insertar Calificaciones
-- 1. Carlos (Reprobando con promedio 7.6)
INSERT INTO grades (enrollment_id, p1, p2, p3, final_score) VALUES 
(1, 8.0, 7.0, 8.0, 7.6);

-- 2. Ana (Aprobando con 9.5)
INSERT INTO grades (enrollment_id, p1, p2, p3, final_score) VALUES 
(2, 10.0, 9.0, 9.5, 9.5);

-- 3. Luis (Apenas pasando con 8.0)
INSERT INTO grades (enrollment_id, p1, p2, p3, final_score) VALUES 
(3, 8.0, 8.0, 8.0, 8.0);