import React, { useState, useEffect, useCallback } from 'react';

const AssignGroups = ({ token }) => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados para los formularios
  const [studentAssign, setStudentAssign] = useState({ userId: '', groupId: '' });
  const [teacherAssign, setTeacherAssign] = useState({ userId: '', groupId: '' });

  // Cargar datos iniciales
  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Traemos grupos, alumnos y profes en paralelo
      const [resG, resS, resT] = await Promise.all([
        fetch('http://localhost:3006/api/admin/groups', { headers }),
        fetch('http://localhost:3006/api/admin/students', { headers }),
        fetch('http://localhost:3006/api/admin/teachers', { headers })
      ]);

      if (resG.ok) setGroups(await resG.json());
      if (resS.ok) setStudents(await resS.json());
      if (resT.ok) setTeachers(await resT.json());
    } catch (error) {
      console.error("Error cargando datos de asignación:", error);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ASIGNAR ALUMNO ---
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3006/api/admin/assign-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(studentAssign)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Alumno asignado al grupo correctamente.' });
        setStudentAssign({ userId: '', groupId: '' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Error al asignar alumno.' });
      }
    } catch (error) { setMessage({ type: 'error', text: 'Error de conexión.' }); }
  };

  // --- ASIGNAR PROFESOR ---
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3006/api/admin/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(teacherAssign)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profesor vinculado al grupo con éxito.' });
        setTeacherAssign({ userId: '', groupId: '' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'El profesor ya está en este grupo.' });
      }
    } catch (error) { setMessage({ type: 'error', text: 'Error de conexión.' }); }
  };

  return (
    <div className="fade-in">
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="admin-grid">
        
        {/* FORMULARIO ALUMNOS */}
        <section className="admin-card">
          <h2>📍 Asignar Alumno a Grupo</h2>
          <p className="subtitle">Recuerda: Un alumno solo puede pertenecer a un grupo activo.</p>
          <form onSubmit={handleStudentSubmit} className="admin-form">
            <div className="form-group">
              <label>Seleccionar Alumno:</label>
              <select 
                value={studentAssign.userId} 
                onChange={e => setStudentAssign({...studentAssign, userId: e.target.value})}
                required
              >
                <option value="">-- Buscar Alumno --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.matricula} - {s.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Grupo Destino:</label>
              <select 
                value={studentAssign.groupId} 
                onChange={e => setStudentAssign({...studentAssign, groupId: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Grupo --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.group_name} ({g.area})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-submit">Inscribir Alumno</button>
          </form>
        </section>

        {/* FORMULARIO PROFESORES */}
        <section className="admin-card">
          <h2>👨‍🏫 Asignar Profesor a Grupo</h2>
          <p className="subtitle">Varios profesores pueden compartir el mismo grupo.</p>
          <form onSubmit={handleTeacherSubmit} className="admin-form">
            <div className="form-group">
              <label>Seleccionar Profesor:</label>
              <select 
                value={teacherAssign.userId} 
                onChange={e => setTeacherAssign({...teacherAssign, userId: e.target.value})}
                required
              >
                <option value="">-- Buscar Profesor --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Grupo a Asignar:</label>
              <select 
                value={teacherAssign.groupId} 
                onChange={e => setTeacherAssign({...teacherAssign, groupId: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Grupo --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.group_name} - {g.area}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-submit btn-teacher">Vincular Profesor</button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default AssignGroups;