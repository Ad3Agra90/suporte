import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tlsEnabled, setTlsEnabled] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/smtp-settings')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const settings = data[0];
          setHost(settings.host);
          setPort(settings.port);
          setUsername(settings.username);
          setPassword(settings.password);
          setTlsEnabled(settings.tlsEnabled);
        }
      })
      .catch(err => console.error('Failed to fetch SMTP settings', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const settings = { host, port, username, password, tlsEnabled };
    fetch('/api/smtp-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then(res => res.json())
      .then(() => setMessage('Configurações salvas com sucesso!'))
      .catch(() => setMessage('Erro ao salvar configurações.'));
  };

  return (
    <div className="settings-container">
      <h2>Configurações SMTP</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Host SMTP:</label>
          <input type="text" value={host} onChange={e => setHost(e.target.value)} required />
        </div>
        <div>
          <label>Porta SMTP:</label>
          <input type="number" value={port} onChange={e => setPort(Number(e.target.value))} required />
        </div>
        <div>
          <label>Usuário SMTP:</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Senha SMTP:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Usar TLS:</label>
          <input type="checkbox" checked={tlsEnabled} onChange={e => setTlsEnabled(e.target.checked)} />
        </div>
        <button type="submit">Salvar</button>
      </form>
      {message && <p className="message">{message}</p>}
      <div>
        <h3>Requisitos para Gmail SMTP</h3>
        <ul>
          <li>Use uma senha de app para autenticação (não sua senha normal).</li>
          <li>Ative o acesso para apps menos seguros na sua conta Google, se necessário.</li>
          <li>Certifique-se de que o host seja <code>smtp.gmail.com</code> e a porta <code>587</code>.</li>
          <li>TLS deve estar habilitado.</li>
        </ul>
      </div>
    </div>
  );
}
