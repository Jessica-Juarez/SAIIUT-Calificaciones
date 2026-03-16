import { useEffect, useState } from 'react';
import { studentService } from '../../api/services';
import { GraduationCap, BookOpen, UserCheck, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await studentService.getHistory(user.id);
        setHistory(data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  // Función auxiliar para determinar estatus (UT: < 8 es Reprobado)
  const getStatus = (score) => {
    if (!score) return { text: 'Cursando', color: 'bg-gray-100 text-gray-600' };
    const num = Number(score);
    if (num >= 8) return { text: 'Aprobado', color: 'bg-green-100 text-green-700' };
    return { text: 'Reprobado', color: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Tarjeta de Perfil */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex justify-between items-center border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500">Matrícula: {user?.matricula}</p>
            <div className="flex gap-3 mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                {user?.area || 'Ingeniería en Software'}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                Estudiante Activo
              </span>
            </div>
          </div>
          <GraduationCap size={48} className="text-blue-600 opacity-20" />
        </div>

        {/* Tabla Historial */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Historial Académico</div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="p-4">Materia</th>
                <th className="p-4">Periodo</th>
                <th className="p-4 text-center">Calif. Final</th>
                <th className="p-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => {
                const status = getStatus(item.final_score);
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.materia} <br/><span className="text-xs text-gray-400">Grupo {item.grupo}</span></td>
                    <td className="p-4 text-sm text-gray-500">{item.periodo}</td>
                    <td className="p-4 text-center font-bold text-lg">{item.final_score ? Number(item.final_score).toFixed(1) : '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;