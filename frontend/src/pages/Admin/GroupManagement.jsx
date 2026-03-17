import React, { useState, useEffect } from 'react';

const GroupManagement = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ 
    group_name: 'A', // Valor inicial
    area: '', 
    cuatrimestre: 1, 
    classroom: '' 
  });

  // --- LISTAS DE OPCIONES ---
  const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cuatrimestres = Array.from({ length: 11 }, (_, i) => i + 1); // [1, 2, ..., 11]
  const carreras = [
    "Desarrollo de Software",
    "Mecatrónica",
    "Infrestructura de Redes",

  ];

  const fetchGroups = async () => {
    try {
      const res = await fetch('http://localhost:3006/api/admin/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setGroups(await res.json());
    } catch (err) { console.error("Error al cargar grupos", err); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.area) return alert("Por favor selecciona una carrera");

    const res = await fetch('http://localhost:3006/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("Grupo creado con éxito");
      setFormData({ group_name: 'A', area: '', cuatrimestre: 1, classroom: '' });
      fetchGroups();
    } else {
      alert("Error al guardar el grupo");
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-card">
        <h2>🏗️ Configuración de Grupos</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          
          <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            {/* SELECT DE LETRA */}
            <div className="form-group">
              <label>Letra del Grupo:</label>
              <select 
                value={formData.group_name} 
                onChange={e => setFormData({...formData, group_name: e.target.value})}
              >
                {letras.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* SELECT DE CUATRIMESTRE */}
            <div className="form-group">
              <label>Cuatrimestre:</label>
              <select 
                value={formData.cuatrimestre} 
                onChange={e => setFormData({...formData, cuatrimestre: e.target.value})}
              >
                {cuatrimestres.map(c => <option key={c} value={c}>{c}° Cuatrimestre</option>)}
              </select>
            </div>

          </div>

          {/* SELECT DE CARRERAS */}
          <div className="form-group">
            <label>Carrera / Área:</label>
            <select 
              value={formData.area} 
              onChange={e => setFormData({...formData, area: e.target.value})}
              required
            >
              <option value="">-- Selecciona una carrera --</option>
              {carreras.map(car => <option key={car} value={car}>{car}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Aula (Opcional):</label>
            <input 
              type="text" 
              placeholder="Ej: K-102"
              value={formData.classroom} 
              onChange={e => setFormData({...formData, classroom: e.target.value})} 
            />
          </div>

          <button type="submit" className="btn-submit">Registrar Grupo</button>
        </form>
      </div>

      {/* TABLA DE GRUPOS */}
      <div className="admin-card" style={{ marginTop: '20px' }}>
        <h3>Grupos Registrados</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Carrera</th>
              <th>Cuatri</th>
              <th>Aula</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? groups.map(g => (
              <tr key={g.id}>
                <td><strong>{g.group_name}</strong></td>
                <td>{g.area}</td>
                <td>{g.cuatrimestre}°</td>
                <td>{g.classroom || 'N/A'}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{textAlign: 'center'}}>No hay grupos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupManagement;