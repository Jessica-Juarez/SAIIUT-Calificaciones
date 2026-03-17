import React, { useEffect, useState } from 'react';
import { studentService } from '../../api/services';
import { GraduationCap, Award, BookOpen, Printer, Info } from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [historyByCuatri, setHistoryByCuatri] = useState({});
  const [maxCuatri, setMaxCuatri] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generalAverage, setGeneralAverage] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user.id) return;
      try {
        const response = await studentService.getHistory(user.id);
        const data = response.data ? response.data : response;
        
        if (Array.isArray(data) && data.length > 0) {
          // 1. Calcular el Promedio General
          const validScores = data.filter(item => item.final_score !== null && Number(item.final_score) > 0);
          if (validScores.length > 0) {
            const total = validScores.reduce((sum, item) => sum + Number(item.final_score), 0);
            setGeneralAverage((total / validScores.length).toFixed(1));
          }

          // 2. Agrupar por cuatrimestre y encontrar el máximo cuatrimestre actual
          let maxC = 1;
          const grouped = {};
          
          data.forEach(item => {
            const cuatri = item.cuatrimestre || 1;
            if (cuatri > maxC) maxC = cuatri;
            
            if (!grouped[cuatri]) grouped[cuatri] = [];
            grouped[cuatri].push(item);
          });

          setMaxCuatri(maxC);
          setHistoryByCuatri(grouped);
        }
      } catch (err) { 
        console.error("Error cargando historial:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchHistory();
  }, [user.id]);

  const getStatus = (score) => {
    const num = Number(score);
    if (!score || num === 0) return { text: 'Cursando', className: 'status-cursando' };
    if (num >= 8) return { text: 'Aprobado', className: 'status-aprobado' };
    return { text: 'Reprobado', className: 'status-reprobado' };
  };

  const handlePrint = () => {
    window.print();
  };

  // Creamos un arreglo de [1, 2, ..., maxCuatri] para renderizar todos los bloques
  const cuatrimestresArray = Array.from({ length: maxCuatri }, (_, i) => i + 1);

  return (
    <div className="student-container">
      {/* TARJETA DE PERFIL (Cabecera) */}
      <div className="student-profile-card">
        <div className="profile-info-wrapper">
          <div className="profile-icon">
            <GraduationCap size={40} />
          </div>
          <div className="profile-text">
            <h1>{user?.name || user?.full_name}</h1>
            <p>Matrícula: <strong>{user?.matricula}</strong></p>
            <div className="badges">
              <span className="badge badge-blue">{user?.area || 'Tronco Común'}</span>
              <span className="badge badge-purple">Estudiante Activo</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {/* Botón de Imprimir (Se oculta al imprimir) */}
          <button className="btn-print no-print" onClick={handlePrint}>
            <Printer size={18} /> Imprimir Boleta
          </button>

          <div className="average-box">
            <p><Award size={16} /> Promedio General</p>
            <h2 className={generalAverage >= 8 ? 'text-green' : 'text-red'}>
              {generalAverage}
            </h2>
          </div>
        </div>
      </div>

      <div className="history-header no-print">
        <h2><BookOpen size={22} /> Historial Académico por Cuatrimestre</h2>
      </div>

      {loading ? (
        <p className="loading-text">Cargando tu historial...</p>
      ) : (
        <div className="cuatrimestres-list">
          {cuatrimestresArray.map((num) => {
            const materias = historyByCuatri[num];
            // Evaluamos si el cuatrimestre está vacío para añadirle la clase 'no-print'
            const isEmpty = !materias || materias.length === 0;

            return (
              <div key={num} className={`cuatrimestre-block ${isEmpty ? 'no-print' : ''}`}>
                <h3 className="cuatrimestre-title">Cuatrimestre {num}</h3>
                
                {!isEmpty ? (
                  <div className="table-wrapper">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>Materia</th>
                          <th>Periodo</th>
                          <th className="text-center">Parcial 1</th>
                          <th className="text-center">Parcial 2</th>
                          <th className="text-center">Calificación Final</th>
                          <th className="text-center">Estatus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materias.map((item, idx) => {
                          const status = getStatus(item.final_score);
                          return (
                            <tr key={idx}>
                              <td>
                                <strong>{item.materia}</strong>
                                <span className="grupo-badge">Grupo {item.grupo}</span>
                              </td>
                              <td className="text-gray">{item.periodo}</td>
                              <td className="text-center">{item.p1 !== null ? Number(item.p1).toFixed(1) : '-'}</td>
                              <td className="text-center">{item.p2 !== null ? Number(item.p2).toFixed(1) : '-'}</td>
                              <td className="text-center font-bold final-score">
                                {item.final_score && Number(item.final_score) > 0 ? Number(item.final_score).toFixed(1) : '-'}
                              </td>
                              <td className="text-center">
                                <span className={`status-badge ${status.className}`}>
                                  {status.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // MENSAJE SI EL CUATRIMESTRE NO TIENE DATOS (Esto no saldrá en la impresión)
                  <div className="empty-cuatrimestre">
                    <Info size={24} className="info-icon" />
                    <div>
                      <h4>Aún no hay registros</h4>
                      <p>Aún estamos esperando tus calificaciones. Si eres alumno de revalidación o transferencia, tus calificaciones anteriores se reflejarán pronto.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;