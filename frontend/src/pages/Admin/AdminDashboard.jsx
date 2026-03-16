import React, { useState } from 'react';
import './AdminDashboard.css';

// --- IMPORTAMOS LOS COMPONENTES (PESTAÑAS) ---
//import AssignGroup from './AssignGroup';
import UserManagement from './UserManagement';
// import StatsDashboard from './StatsDashboard'; // Pendiente
// import TeachersList from './TeachersList';     // Pendiente

const AdminDashboard = ({ token }) => {
  // Estado que controla qué pantalla estamos viendo. 'home' es el menú principal.
  const [activeTab, setActiveTab] = useState('home');

  // --- 1. VISTA DEL MENÚ PRINCIPAL (HOME) ---
  if (activeTab === 'home') {
    return (
      <div className="admin-container fade-in">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <p>Selecciona un módulo para gestionar el Sistema Escolar.</p>
        </header>

        <div className="dashboard-grid">
          {/* Tarjeta 1: Asignar Grupos */}
          <div className="menu-card" onClick={() => setActiveTab('assignGroup')}>
            <img src="https://cdn-icons-png.flaticon.com/512/3233/3233483.png" alt="Grupos" className="menu-icon" />
            <h3>Asignar Grupos</h3>
            <p>Crea grupos, define cuatrimestres y asigna profesores a materias.</p>
          </div>

          {/* Tarjeta 2: Gestión de Usuarios */}
          <div className="menu-card" onClick={() => setActiveTab('users')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1256/1256650.png" alt="Usuarios" className="menu-icon" />
            <h3>Gestión de Usuarios</h3>
            <p>Alta, baja y edición de Alumnos y Profesores. Asignación de carreras.</p>
          </div>

          {/* Tarjeta 3: Directorio Docente */}
          <div className="menu-card" onClick={() => setActiveTab('teachers')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1048/1048949.png" alt="Profesores" className="menu-icon" />
            <h3>Directorio Docente</h3>
            <p>Consulta rápida de la plantilla de profesores registrados.</p>
          </div>

          {/* Tarjeta 4: Estadísticas */}
          <div className="menu-card" onClick={() => setActiveTab('stats')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1541/1541433.png" alt="Estadísticas" className="menu-icon" />
            <h3>Estadísticas (Dashboard)</h3>
            <p>Visualiza gráficas, total de alumnos y reportes de desempeño.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. VISTA DE LAS PANTALLAS SECUNDARIAS ---
  return (
    <div className="admin-container">
      {/* Botón universal para regresar al menú */}
      <button className="btn-back" onClick={() => setActiveTab('home')}>
        ⬅ Volver al Menú Principal
      </button>

      <div className="admin-content">
        {/* Aquí renderizamos el componente dependiendo de la tarjeta que clickearon */}
        {activeTab === 'assignGroup' && <AssignGroup token={token} />}
        
        {/* Dejo estos como "En construcción" mientras hacemos los archivos */}
        {activeTab === 'users' && (
          <div className="admin-card fade-in">
            <h2>Gestión de Usuarios</h2>
           {activeTab === 'users' && <UserManagement token={token} />}
          </div>
        )}
        
        {activeTab === 'teachers' && (
          <div className="admin-card fade-in">
            <h2>Directorio Docente</h2>
            <p>🛠️ Módulo en construcción... (Aquí irá TeachersList.jsx)</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="admin-card fade-in">
            <h2>Estadísticas</h2>
            <p>🛠️ Módulo en construcción... (Aquí irá StatsDashboard.jsx)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;