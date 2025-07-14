import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './assets/Login_page/login';
import Header from './assets/components/Header/Header';
import Settings from './assets/Pages/Configurações/Settings';
import Chat from './assets/Pages/Chat/Chat';
import Chamados from './assets/Pages/Chamados/Chamados';
import Tasks from './assets/Pages/Tasks/Tasks';
import Admin from './assets/Pages/Admin/Admin';
import Home from './assets/Pages/Home/Home';
import './App.css';

function DefaultHome({ username }) {
  return (
    <main>
      <h2>Welcome, {username}!</h2>
      {/* Other app content */}
    </main>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [permission, setPermission] = useState(localStorage.getItem('permission') || 'Cliente');

  useEffect(() => {
    // Removed console logs of sensitive information for security
    if (!token) {
      setUsername(null);
      setPermission('Cliente');
      localStorage.removeItem('username');
      localStorage.removeItem('permission');
    }
  }, [token, username]);

  const handleLoginSuccess = (token, username, permission) => {
    // Removed console logs of sensitive information for security
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('permission', permission);
    setToken(token);
    setUsername(username);
    setPermission(permission || 'Cliente');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('permission');
    setToken(null);
    setUsername(null);
    setPermission('Cliente');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <Router>
        <Header username={username} onLogout={handleLogout} permission={permission.toLowerCase()} />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Home username={username} />} />
            {(permission.toLowerCase() === 'admin' || permission.toLowerCase() === 'tecnico') && (
              <Route path="/admin" element={<Admin />} />
            )}
            {permission.toLowerCase() === 'admin' && (
              <Route path="/configuracoes" element={<Settings />} />
            )}
            <Route path="/chat" element={<Chat />} />
            <Route path="/chamados" element={<Chamados />} />
            {permission.toLowerCase() === 'tecnico' && (
              <Route path="/tasks" element={<Tasks />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
  );
}
