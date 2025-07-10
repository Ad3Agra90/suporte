import React, { useState, useEffect } from 'react';
import '../Chamados/Chamados.css';

export default function Chamados() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    fetchChamados();
  }, []);

  const fetchChamados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chamados', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch chamados:', error);
      setTickets([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chamados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          chamado: title.trim(),
          descricao: description.trim(),
        }),
      });
      if (response.ok) {
        await fetchChamados();
        setTitle('');
        setDescription('');
      } else {
        const errorText = await response.text();
        console.error('Failed to create chamado:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error creating chamado:', error);
    }
  };

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content || 'Sem informação disponível.');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent('');
    setModalTitle('');
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return 'status-aberto';
      case 'em análise':
        return 'status-em-analise';
      case 'fechado':
        return 'status-fechado';
      default:
        return '';
    }
  };

  return (
    <div className="chamados-container">
      <h1>Abertura e acompanhamento de chamados</h1>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <label>
          Chamado:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do chamado"
            required
          />
        </label>

        <label>
          Descrição:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o chamado"
            required
          />
        </label>

        <button type="submit">Enviar</button>
      </form>

      <h2>Chamados Abertos</h2>
      <table className="tickets-table">
        <thead>
          <tr>
            <th>Chamado</th>
            <th>Descrição</th>
            <th>Resposta</th>
            <th>Previsão</th>
            <th>Atendente</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.chamado}</td>
              <td>
                <button onClick={() => openModal('Descrição', ticket.descricao)}>Ver Descrição</button>
              </td>
              <td>
                <button onClick={() => openModal('Resposta', ticket.resposta)}>Ver Resposta</button>
              </td>
              <td>{ticket.previsao || 'A definir'}</td>
              <td>{ticket.tecnico || '-'}</td>
              <td>
                <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalTitle}</h3>
            <p>{modalContent}</p>
            <button onClick={closeModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
