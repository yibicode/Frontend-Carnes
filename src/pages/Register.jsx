import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { register } from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await register(username, password, 'CLIENTE');
      setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ flex: 1 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Registro</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Validar Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            <UserPlus size={20} />
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
