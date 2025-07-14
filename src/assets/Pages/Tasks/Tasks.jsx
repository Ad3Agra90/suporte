import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './Tasks.css';

export default function Tasks() {
  const [statusColumns, setStatusColumns] = useState({
    aberto: [],
    emAnalise: [],
    fechado: []
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [resposta, setResposta] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [status, setStatus] = useState('');
  const [previsao, setPrevisao] = useState('');
  const [currentUserIsTecnico, setCurrentUserIsTecnico] = useState(false);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    fetchChamados();
    const permission = localStorage.getItem('permission') || '';
    setCurrentUserIsTecnico(permission.toLowerCase() === 'tecnico');
    setCurrentUserIsAdmin(permission.toLowerCase() === 'admin' || permission.toLowerCase() === 'master');

    // Setup WebSocket connection
    clientRef.current = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      reconnectDelay: 5000,
      debug: function (str) {
        console.log(str);
      },
    });

    clientRef.current.onConnect = () => {
      clientRef.current.subscribe('/topic/chamados', message => {
        if (message.body) {
          const body = message.body;
          if (body.startsWith('deleted:')) {
            const deletedId = body.split(':')[1];
            setStatusColumns(prev => {
              const newStatusColumns = { ...prev };
              Object.keys(newStatusColumns).forEach(key => {
                newStatusColumns[key] = newStatusColumns[key].filter(c => c.id.toString() !== deletedId);
              });
              return newStatusColumns;
            });
          } else {
            const updatedChamado = JSON.parse(body);
            setStatusColumns(prev => {
              // Remove updatedChamado from all columns
              const newStatusColumns = { aberto: [], emAnalise: [], fechado: [] };
              Object.keys(prev).forEach(key => {
                newStatusColumns[key] = prev[key].filter(c => c.id !== updatedChamado.id);
              });
              // Add back other unchanged chamados
              Object.keys(prev).forEach(key => {
                if (key !== updatedChamado.status.toLowerCase().replace(' ', '')) {
                  newStatusColumns[key] = [...newStatusColumns[key], ...prev[key].filter(c => c.id !== updatedChamado.id)];
                }
              });
              // Add updatedChamado to the correct column based on status
              let statusKey = updatedChamado.status.toLowerCase().replace(' ', '');
              // Fix mapping for "em análise" to "emAnalise"
              if (statusKey === 'emanálise' || statusKey === 'em análise') {
                statusKey = 'emAnalise';
              }
              console.log('WebSocket update statusKey:', statusKey);
              console.log('Current status columns keys:', Object.keys(newStatusColumns));
              if (newStatusColumns[statusKey]) {
                newStatusColumns[statusKey] = [...newStatusColumns[statusKey], updatedChamado];
              }
              return newStatusColumns;
            });
          }
        }
      });
    };

    clientRef.current.activate();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const fetchChamados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chamados/kanban', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Group chamados by status from backend
        const aberto = data.filter(c => c.status.toLowerCase() === 'aberto');
        const emAnalise = data.filter(c => c.status.toLowerCase() === 'em análise');
        const fechado = data.filter(c => c.status.toLowerCase() === 'fechado');
        setStatusColumns({
          aberto,
          emAnalise,
          fechado
        });
      }
    } catch (error) {
      console.error('Failed to fetch chamados:', error);
    }
  };

  const openModal = (chamado) => {
    setSelectedChamado(chamado);
    setResposta(chamado.resposta || '');
    setPrioridade(chamado.prioridade || '');
    setStatus(chamado.status || '');
    setPrevisao(chamado.previsao ? chamado.previsao.substring(0, 10) : '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedChamado(null);
    setResposta('');
    setPrioridade('');
    setStatus('');
    setPrevisao('');
  };

  const saveChanges = async () => {
    if (!selectedChamado) return;
    try {
      const token = localStorage.getItem('token');
      const updatedChamado = {
        ...selectedChamado,
        resposta,
        prioridade,
        status,
        previsao
      };
      console.log('Saving chamado:', updatedChamado);
      const response = await fetch(`/api/chamados/${selectedChamado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updatedChamado),
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        closeModal();
      } else {
        const errorText = await response.text();
        console.error('Failed to update chamado:', errorText);
        alert('Falha ao salvar chamado: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating chamado:', error);
      alert('Erro ao salvar chamado: ' + error.message);
    }
  };

  return (
    <div className="tasks-kanban-container">
      <h1>Quadro de Chamados - Técnico: {localStorage.getItem('username') || 'Desconhecido'}</h1>
      <div className="kanban-board">
        <div className="kanban-column">
          <h2>Aberto</h2>
          {statusColumns.aberto.map(chamado => (
            <div key={chamado.id} className="kanban-card" onClick={() => openModal(chamado)}>
              <div><strong>Chamado:</strong> {chamado.chamado}</div>
              <div><strong>Usuário:</strong> {chamado.usuario}</div>
              <div><strong>Empresa:</strong> {chamado.empresaUsuario || 'Desconhecida'}</div>
              <div>
                <strong>Prioridade:</strong> 
                <span style={{
                  backgroundColor:
                    chamado.prioridade === 'Baixa' ? 'green' :
                    chamado.prioridade === 'Média' ? 'yellow' :
                    chamado.prioridade === 'Alta' ? 'red' : 'transparent',
                  color:
                    chamado.prioridade === 'Baixa' ? 'white' :
                    chamado.prioridade === 'Média' ? 'black' :
                    chamado.prioridade === 'Alta' ? 'white' : 'black',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {chamado.prioridade}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="kanban-column">
          <h2>Em análise</h2>
          {statusColumns.emAnalise.map(chamado => (
            <div key={chamado.id} className="kanban-card" onClick={() => openModal(chamado)}>
              <div><strong>Chamado:</strong> {chamado.chamado}</div>
              <div><strong>Usuário:</strong> {chamado.usuario}</div>
              <div><strong>Empresa:</strong> {chamado.empresaUsuario || 'Desconhecida'}</div>
              <div>
                <strong>Prioridade:</strong> 
                <span style={{
                  backgroundColor:
                    chamado.prioridade === 'Baixa' ? 'green' :
                    chamado.prioridade === 'Média' ? 'yellow' :
                    chamado.prioridade === 'Alta' ? 'red' : 'transparent',
                  color:
                    chamado.prioridade === 'Baixa' ? 'white' :
                    chamado.prioridade === 'Média' ? 'black' :
                    chamado.prioridade === 'Alta' ? 'white' : 'black',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {chamado.prioridade}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="kanban-column">
          <h2>Fechado</h2>
          {statusColumns.fechado.map(chamado => (
            <div key={chamado.id} className="kanban-card" onClick={() => openModal(chamado)}>
              <div><strong>Chamado:</strong> {chamado.chamado}</div>
              <div><strong>Usuário:</strong> {chamado.usuario}</div>
              <div><strong>Empresa:</strong> {chamado.empresaUsuario || 'Desconhecida'}</div>
              <div>
                <strong>Prioridade:</strong> 
                <span style={{
                  backgroundColor:
                    chamado.prioridade === 'Baixa' ? 'green' :
                    chamado.prioridade === 'Média' ? 'yellow' :
                    chamado.prioridade === 'Alta' ? 'red' : 'transparent',
                  color:
                    chamado.prioridade === 'Baixa' ? 'white' :
                    chamado.prioridade === 'Média' ? 'black' :
                    chamado.prioridade === 'Alta' ? 'white' : 'black',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {chamado.prioridade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Chamado: {selectedChamado.chamado}</h2>
            <p><strong>Descrição:</strong> {selectedChamado.descricao}</p>

            <label>
              Resposta:
            <textarea
              value={resposta}
              onChange={e => setResposta(e.target.value)}
              rows={4}
              disabled={!(currentUserIsTecnico || currentUserIsAdmin)}
            />
            </label>

            <label>
              Prioridade:
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value)}
                disabled={!(currentUserIsTecnico || currentUserIsAdmin)}
              >
                <option value="">Selecione</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </label>

            <label>
              Status:
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={!(currentUserIsTecnico || currentUserIsAdmin)}
              >
                <option value="Aberto">Aberto</option>
                <option value="Em análise">Em análise</option>
                <option value="Fechado">Fechado</option>
              </select>
            </label>

            <label>
              Previsão de conclusão:
              <input
                type="date"
                value={previsao}
                onChange={e => setPrevisao(e.target.value)}
                disabled={!(currentUserIsTecnico || currentUserIsAdmin)}
              />
            </label>

            <button onClick={saveChanges} disabled={!(currentUserIsTecnico || currentUserIsAdmin)}>Salvar</button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
