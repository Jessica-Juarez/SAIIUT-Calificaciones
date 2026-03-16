import React, { useEffect, useState } from 'react';
import { teacherService } from '../../api/services';
import { Users, Save, ChevronLeft } from 'lucide-react';
import './TeacherDashboard.css'; // ¡Nuestra nueva hoja de estilos!

const TeacherDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null); // Objeto del grupo seleccionado completo
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener usuario del localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Cargar Grupos al inicio
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { data } = await teacherService.getMyGroups(user.id);
        setGroups(data);
      } catch (err) {
        console.error("Error cargando grupos", err);
      }
    };
    if (user?.id) loadGroups();
  }, [user]);

  // 2. Cargar Alumnos cuando seleccionas un grupo
  const handleSelectGroup = async (group) => {
    setLoading(true);
    setSelectedGroup(group);
    try {
      const { data } = await teacherService.getGroupStudents(group.id);
      setStudents(data);
    } catch (err) {
      alert("Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (enrollmentId, grades) => {
    try {
      // Calculamos un promedio simple para el final_score (puedes ajustar esta lógica según tu escuela)
      const p1 = parseFloat(grades.p1) || 0;
      const p2 = parseFloat(grades.p2) || 0;
      const p3 = parseFloat(grades.p3) || 0;
      const finalScore = ((p1 + p2 + p3) / 3).toFixed(1);

      await teacherService.updateGrade({
        enrollmentId,
        p1, p2, p3,
        finalScore
      });
      alert('¡Calificación guardada con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la calificación');
    }
  };

  return (
    <div className="teacher-container">
      <header className="teacher-header">
        <h1>Panel del Profesor</h1>
        <p>Bienvenido, {user?.name || 'Profesor'}</p>
      </header>

      {/* VISTA 1: LISTA DE GRUPOS */}
      {!selectedGroup && (
        <div className="groups-section">
          <h2>Tus Grupos Asignados</h2>
          <div className="groups-grid">
            {groups.length > 0 ? (
              groups.map(group => (
                <div key={group.id} className="group-card" onClick={() => handleSelectGroup(group)}>
                  <div className="group-card-header">
                    <Users size={24} className="icon-group" />
                    <h3>Grupo {group.grupo}</h3>
                  </div>
                  <div className="group-card-body">
                    <p><strong>Materia:</strong> {group.materia}</p>
                    <p><strong>Periodo:</strong> {group.periodo}</p>
                    <p><strong>Salón:</strong> {group.classroom}</p>
                  </div>
                  <button className="btn-view-students">Ver Alumnos</button>
                </div>
              ))
            ) : (
              <p className="no-data">No tienes grupos asignados en este periodo.</p>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: LISTA DE ALUMNOS DEL GRUPO SELECCIONADO */}
      {selectedGroup && (
        <div className="students-section">
          <div className="students-header">
            <button className="btn-back" onClick={() => setSelectedGroup(null)}>
              <ChevronLeft size={20} /> Volver a Grupos
            </button>
            <h2>Alumnos - Grupo {selectedGroup.grupo} ({selectedGroup.materia})</h2>
          </div>

          {loading ? (
            <p className="loading-text">Cargando alumnos...</p>
          ) : (
            <div className="table-wrapper">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Nombre del Alumno</th>
                    <th>Matrícula</th>
                    <th className="text-center">Parcial 1</th>
                    <th className="text-center">Parcial 2</th>
                    <th className="text-center">Parcial 3</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s) => (
                      <StudentRow key={s.student_id} student={s} onSave={handleSaveGrade} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-4">No hay alumnos inscritos en este grupo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente pequeño para manejar los inputs de cada fila independientemente
const StudentRow = ({ student, onSave }) => {
  const [grades, setGrades] = useState({
    p1: student.p1 || '',
    p2: student.p2 || '',
    p3: student.p3 || ''
  });

  return (
    <tr>
      <td className="student-name">{student.full_name}</td>
      <td className="student-matricula">{student.matricula}</td>
      <td className="text-center">
        <input 
          type="number" 
          step="0.1"
          min="0" max="10"
          className="grade-input" 
          value={grades.p1} 
          onChange={e => setGrades({...grades, p1: e.target.value})} 
        />
      </td>
      <td className="text-center">
        <input 
          type="number" 
          step="0.1"
          min="0" max="10"
          className="grade-input" 
          value={grades.p2} 
          onChange={e => setGrades({...grades, p2: e.target.value})} 
        />
      </td>
      <td className="text-center">
        <input 
          type="number" 
          step="0.1"
          min="0" max="10"
          className="grade-input" 
          value={grades.p3} 
          onChange={e => setGrades({...grades, p3: e.target.value})} 
        />
      </td>
      <td className="text-center">
        <button 
          className="btn-save" 
          onClick={() => onSave(student.enrollment_id, grades)}
          title="Guardar Calificaciones"
        >
          <Save size={18} /> Actualizar
        </button>
      </td>
    </tr>
  );
};

export default TeacherDashboard;