import React, { useState, useEffect, useCallback } from 'react';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    matricula: '',
    full_name: '',
    email: '', // Agregado: Requerido por el backend
    password: '',
    role: 'student',
    area: ''
  });

  // --- FUNCIÓN DE CARGA CON AUTORIZACIÓN ---
  const fetchUsers = useCallback(async () => {
    // Si no hay token, ni siquiera intentamos la petición
    if (!token) {
      setMessage({ type: 'error', text: 'Error: No se detectó una sesión activa (Token faltante).' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3006/api/admin/users', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: `Error de autorización: ${errorData.error || 'Acceso denegado'}` });
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setMessage({ type: 'error', text: 'No se pudo conectar con el servidor.' });
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- CREAR USUARIO ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const dataToSend = { ...formData };
    if (dataToSend.role !== 'student') dataToSend.area = null;

    try {
      const res = await fetch('http://localhost:3006/api/admin/users', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Usuario registrado correctamente!' });
        setFormData({ matricula: '', full_name: '', email: '', password: '', role: 'student', area: '' });
        fetchUsers();
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'No se pudo crear el usuario.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al registrar.' });
    }
  };

  // --- ELIMINAR USUARIO ---
  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${name}?`)) return;

    try {
      const res = await fetch(`http://localhost:3006/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuario eliminado.' });
        fetchUsers();
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Error al eliminar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red.' });
    }
  };

  // --- FILTRADO ---
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.matricula && u.matricula.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="fade-in">
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <section className="admin-card">
        <h2>Registrar Nuevo Usuario</h2>
        <form onSubmit={handleCreateUser} className="admin-form">
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Rol:</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="student">Alumno</option>
                <option value="teacher">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Matrícula / ID:</label>
              <input type="text" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})} required />
            </div>
          </div>

          <div className="form-group">
            <label>Nombre Completo:</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Email Institucional:</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="ejemplo@uttehuacan.edu.mx" />
          </div>

          {formData.role === 'student' && (
            <div className="form-group">
              <label>Carrera:</label>
              <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} required>
                <option value="">-- Selecciona --</option>
                <option value="Desarrollo de Software">Desarrollo de Software</option>
                <option value="Infraestructura de Redes">Infraestructura de Redes</option>
                <option value="Mecatrónica">Mecatrónica</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Contraseña Temporal:</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>

          <button type="submit" className="btn-submit">Dar de Alta</button>
        </form>
      </section>

      <section className="admin-card" style={{ marginTop: '20px' }}>
        <div className="filter-header">
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre o matrícula..." 
            className="search-input"
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="role-filter" onChange={e => setFilterRole(e.target.value)}>
            <option value="all">Todos los roles</option>
            <option value="student">Alumnos</option>
            <option value="teacher">Profesores</option>
            <option value="admin">Administradores</option>
          </select>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Área</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.matricula}</strong></td>
                  <td>{u.full_name}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.area || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-delete" onClick={() => handleDelete(u.id, u.full_name)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;