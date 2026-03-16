import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// --- IMPORTACIÓN DE PÁGINAS ---
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.jsx';

// Componente para manejar el diseño de página no encontrada
const NotFound = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    fontFamily: 'sans-serif',
    color: '#666'
  }}>
    <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
    <p style={{ fontSize: '1.5rem' }}>Página no encontrada</p>
    <a href="/" style={{ color: '#3498db', textDecoration: 'none', marginTop: '20px', fontWeight: 'bold' }}>
      Volver al inicio
    </a>
  </div>
);

function App() {
  // Esta función recupera el token del localStorage para inyectarlo en los componentes
  // Se llama en cada renderizado de ruta para asegurar que el token esté fresco
  const getSessionToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Si el usuario ya tiene token, el Login debería redirigirlo internamente 
            o puedes dejarlo así para que el usuario pueda volver a loguearse */}
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PROTEGIDAS --- */}
        {/* El componente ProtectedRoute valida internamente el token y el rol */}
        
        {/* 1. Módulo de Administración */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route 
            path="/admin" 
            element={<AdminDashboard token={getSessionToken()} />} 
          />
        </Route>

        {/* 2. Módulo de Profesores */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route 
            path="/teacher" 
            element={<TeacherDashboard token={getSessionToken()} />} 
          />
        </Route>

        {/* 3. Módulo de Alumnos */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route 
            path="/student" 
            element={<StudentDashboard token={getSessionToken()} />} 
          />
        </Route>

        {/* --- REDIRECCIONES Y ERRORES --- */}
        {/* Si entran a la raíz "/", mandarlos al login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Captura cualquier otra ruta no definida */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;