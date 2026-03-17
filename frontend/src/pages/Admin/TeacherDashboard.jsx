import React, { useState, useEffect } from 'react';


const TeacherDashboard = ({ user, token }) => {
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);

  // Cargar grupos del profesor
  useEffect(() => {
    fetch(`http://localhost:3006/api/teacher/my-groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMyGroups(data))
      .catch(err => console.error("Error:", err));
  }, [token]);

  // Cargar alumnos cuando seleccione un grupo
  const handleViewStudents = async (groupId) => {
    setSelectedGroup(groupId);
    const res = await fetch(`http://localhost:3006/api/teacher/groups/${groupId}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStudents(await res.json());
  };

  return (
    <div className="teacher-container">
      <header className="teacher-header">
        <h1>Bienvenido, Prof. {user.full_name}</h1>
        <p>Panel de Gestión de Calificaciones</p>
      </header>

      <div className="teacher-content">
        {/* LISTA DE GRUPOS */}
        <section className="groups-section">
          <h2>📚 Mis Grupos y Materias</h2>
          <div className="groups-grid">
            {myGroups.map(g => (
              <div key={g.group_id} className="group-card" onClick={() => handleViewStudents(g.group_id)}>
                <h3>{g.group_name} - {g.cuatrimestre}°</h3>
                <p><strong>Materia:</strong> {g.subject_name}</p>
                <button className="btn-manage">Gestionar Alumnos</button>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA DE ALUMNOS DEL GRUPO SELECCIONADO */}
        {selectedGroup && (
          <section className="students-section fade-in">
            <h2>Alumnos de {myGroups.find(g => g.group_id === selectedGroup)?.group_name}</h2>
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nombre</th>
                  <th>P1</th>
                  <th>P2</th>
                  <th>P3</th>
                  <th>Final</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.student_id}>
                    <td>{s.matricula}</td>
                    <td>{s.full_name}</td>
                    <td><input type="number" defaultValue={s.p1} className="input-grade" /></td>
                    <td><input type="number" defaultValue={s.p2} className="input-grade" /></td>
                    <td><input type="number" defaultValue={s.p3} className="input-grade" /></td>
                    <td><strong>{s.final_score || '0.0'}</strong></td>
                    <td><button className="btn-save">💾</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;