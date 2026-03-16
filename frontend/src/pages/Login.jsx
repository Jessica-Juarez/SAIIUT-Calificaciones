import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { LogIn, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Llamamos al backend
      const response = await authService.login(formData.email, formData.password);
      
      // Manejo de la estructura de axios (response.data)
      const data = response.data;

      if (data && data.token) {
        // 2. Guardamos sesión de forma persistente
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 3. Redirigimos según el rol
        // Nota: Asegúrate de que el backend devuelva data.user.role
        const role = data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'teacher') navigate('/teacher');
        else if (role === 'student') navigate('/student');
        else navigate('/'); // Fallback
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }
      
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.response?.data?.error || 'Credenciales incorrectas o error de servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo-placeholder">🏫</div>
          <h2>SGE UT Tehuacán</h2>
          <p>Sistema de Gestión Escolar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="ejemplo@uttehuacan.edu.mx"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="btn-login"
          >
            {loading ? (
              'Verificando...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <LogIn size={18} /> Iniciar Sesión
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;