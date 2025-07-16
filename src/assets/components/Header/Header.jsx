import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link } from "react-router-dom";

export default function Header({ username }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [permission, setPermission] = useState('Cliente');

  useEffect(() => {
    const perm = localStorage.getItem('permission') || 'Cliente';
    setPermission(perm);
  }, []);

  // Base menu items always shown
  const menuItems = [
    { href: '/', iconName: 'home-outline', text: 'Home' },
    { href: '/chat', iconName: 'logo-wechat', text: 'Chat' },
  ];

  // Conditionally add menu items for admin
  if (permission.toLowerCase() === 'admin') {
    menuItems.push(
      { href: '/chamados', iconName: 'chatbubble-outline', text: 'Chamado' },
      { href: '/admin', iconName: 'shield-checkmark-outline', text: 'Admin' },
      { href: '/configuracoes', iconName: 'settings-outline', text: 'Ajustes' }
    );
  } else if (permission.toLowerCase() === 'tecnico') {
    menuItems.push(
      { href: '/tasks', iconName: 'clipboard-outline', text: 'Tasks' }
    );
  } else {
    // For other permissions, show chamado tab
    menuItems.push(
      { href: '/chamados', iconName: 'chatbubble-outline', text: 'Chamado' }
    );
  }

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  // Calculate indicator position based on activeIndex only, fixed width
  const indicatorStyle = {
    transform: `translateX(calc(70px * ${activeIndex}))`,
    width: `70px`
  };

  // Load ionicons script dynamically
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js';
    script1.type = 'module';
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js';
    script2.noModule = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  const handleLogout = async () => {
    const usernameStored = localStorage.getItem('username');
    if (!usernameStored) return;
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameStored }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('permission');
    window.location.href = '/login';
  };

  return (
    <header className="app-header">
      <div className="header-logo">
        <img src="/src/assets/img/logo_white.webp" alt="MyAppLogo" className="header-logo-img" />
      </div>
      <nav className="navigation" style={{ width: `${menuItems.length * 70}px` }}>
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => handleClick(index)}
            >
              <Link to={item.href}>
                <span className="icon">
                  <ion-icon name={item.iconName}></ion-icon>
                </span>
                <span className="text">{item.text}</span>
              </Link>
            </li>
          ))}
          <div className="indicator" style={indicatorStyle}></div>
        </ul>
      </nav>
      <div className="header-user">
        <span className="username">Hello, {username}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
