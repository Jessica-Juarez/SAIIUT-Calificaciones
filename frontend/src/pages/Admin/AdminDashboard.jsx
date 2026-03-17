import React, { useState } from 'react';
import './AdminDashboard.css';

// --- IMPORTAMOS LOS COMPONENTES (PESTAÑAS) ---
// CORRECCIÓN: Importamos como AssignGroups (con 's') para que coincida con el uso abajo
import AssignGroups from './AssignGroups';
import UserManagement from './UserManagement';
import GroupManagement from './GroupManagement';

const AdminDashboard = ({ token }) => {
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
          {/* Al dar click, activamos la pestaña 'assignGroup' */}
          <div className="menu-card" onClick={() => setActiveTab('assignGroup')}>
            <img src="https://cdn-icons-png.flaticon.com/512/3233/3233483.png" alt="Grupos" className="menu-icon" />
            <h3>Asignar Grupos</h3>
            <p>Crea grupos, define cuatrimestres y asigna profesores a materias.</p>
          </div>

          <div className="menu-card" onClick={() => setActiveTab('users')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1256/1256650.png" alt="Usuarios" className="menu-icon" />
            <h3>Gestión de Usuarios</h3>
            <p>Alta, baja y edición de Alumnos y Profesores.</p>
          </div>

          <div className="menu-card" onClick={() => setActiveTab('teachers')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1048/1048949.png" alt="Profesores" className="menu-icon" />
            <h3>Directorio Docente</h3>
            <p>Consulta rápida de la plantilla de profesores.</p>
          </div>

          <div className="menu-card" onClick={() => setActiveTab('stats')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1541/1541433.png" alt="Estadísticas" className="menu-icon" />
            <h3>Estadísticas</h3>
            <p>Visualiza gráficas y reportes de desempeño.</p>
          </div>
          <div className="menu-card" onClick={() => setActiveTab('manageGroups')}>
            <img src="https://cdn-icons-png.flaticon.com/512/983/983281.png" alt="Grupos" className="menu-icon" />
            <h3>Gestionar Grupos</h3>
            <p>Crea, edita o elimina los grupos existentes en el sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. VISTA DE LAS PANTALLAS SECUNDARIAS ---
  return (
    <div className="admin-container">
      <button className="btn-back" onClick={() => setActiveTab('home')}>
        ⬅ Volver al Menú Principal
      </button>

      <div className="admin-content">
        {/* --- 1. ASIGNAR GRUPOS --- */}
        {/* Verificamos que el nombre del componente coincida con el import de arriba */}
        {activeTab === 'assignGroup' && (
          <div className="admin-card fade-in">
            <AssignGroups token={token} />
          </div>
        )}

        {/* --- 2. GESTIÓN DE USUARIOS --- */}
        {activeTab === 'users' && (
          <div className="admin-card fade-in">
            <h2>Gestión de Usuarios</h2>
            <UserManagement token={token} />
          </div>
        )}

        {/* --- 3. DIRECTORIO DOCENTE --- */}
        {activeTab === 'teachers' && (
          <div className="admin-card fade-in">
            <h2>Directorio Docente</h2>
            <p style={{ textAlign: 'center', padding: '20px' }}>🛠️ Módulo en construcción...</p>
          </div>
        )}

        {/* --- 4. ESTADÍSTICAS --- */}
        {activeTab === 'stats' && (
          <div className="admin-card fade-in">
            <h2>Estadísticas Generales</h2>
            <p style={{ textAlign: 'center', padding: '20px' }}>🛠️ Módulo en construcción...</p>
          </div>
        )}
        {/* --- 5. GESTIÓN DE GRUPOS --- */}
        <div className="admin-content">
          {activeTab === 'manageGroups' && <GroupManagement token={token} />}

          {activeTab === 'assignGroup' && (
            <div className="admin-card fade-in">
              <AssignGroups token={token} />
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default AdminDashboard;