import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientView from './pages/ClientView';
import { logout } from './api';
import './index.css';

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired) {
    const isRequiredAdmin = roleRequired === 'ADMIN' || roleRequired === 'ROLE_ADMIN';
    const isUserAdmin = rol === 'ADMIN' || rol === 'ROLE_ADMIN';
    
    if (isRequiredAdmin && !isUserAdmin) {
      return <Navigate to="/catalogo" replace />;
    } else if (!isRequiredAdmin && isUserAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const Navbar = ({ token, onLogout }) => {
  const username = localStorage.getItem('username');

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="navbar-brand">
          <ShieldCheck color="#ef4444" size={32} />
          <span>Safelabels</span>
        </div>
        {token && (
          <div className="navbar-nav">
            <span style={{ color: 'var(--text-secondary)' }}>Hola, {username}</span>
            <button onClick={onLogout} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    logout();
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <main className="page-wrapper container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roleRequired="ADMIN">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/catalogo" 
            element={
              <ProtectedRoute roleRequired="CLIENTE">
                <ClientView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
