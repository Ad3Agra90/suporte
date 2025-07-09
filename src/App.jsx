import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './assets/Login_page/login';
import Header from './assets/components/Header/Header';
import Settings from './assets/Pages/Configurações/Settings';
import Chat from './assets/Pages/Chat/Chat';
import Mensagens from './assets/Pages/Mensagens/Mensagens';
import './App.css';

function Home({ username }) {
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

  useEffect(() => {
    // Removed console logs of sensitive information for security
    if (!token) {
      setUsername(null);
      localStorage.removeItem('username');
    }
  }, [token, username]);

  const handleLoginSuccess = (token, username) => {
    // Removed console logs of sensitive information for security
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setToken(token);
    setUsername(username);
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
    setToken(null);
    setUsername(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <Router>
        <Header username={username} onLogout={handleLogout} />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Home username={username} />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
  );
}
