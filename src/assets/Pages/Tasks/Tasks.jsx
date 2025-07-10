import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchChamados();
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
      const response = await fetch(`/api/chamados/${selectedChamado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updatedChamado),
      });
      if (response.ok) {
        await fetchChamados();
        closeModal();
      } else {
        console.error('Failed to update chamado');
      }
    } catch (error) {
      console.error('Error updating chamado:', error);
    }
  };

  return (
    <div className="tasks-kanban-container">
      <h1>Kanban de Chamados</h1>
      <div className="kanban-board">
        <div className="kanban-column">
          <h2>Aberto</h2>
          {statusColumns.aberto.map(chamado => (
            <div key={chamado.id} className="kanban-card" onClick={() => openModal(chamado)}>
              <div><strong>Chamado:</strong> {chamado.chamado}</div>
              <div><strong>Usuário:</strong> {chamado.usuario}</div>
              <div><strong>Empresa:</strong> {chamado.empresa_usuario}</div>
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
              <div><strong>Empresa:</strong> {chamado.empresa_usuario}</div>
              <div><strong>Prioridade:</strong> {chamado.prioridade}</div>
            </div>
          ))}
        </div>
        <div className="kanban-column">
          <h2>Fechado</h2>
          {statusColumns.fechado.map(chamado => (
            <div key={chamado.id} className="kanban-card" onClick={() => openModal(chamado)}>
              <div><strong>Chamado:</strong> {chamado.chamado}</div>
              <div><strong>Usuário:</strong> {chamado.usuario}</div>
              <div><strong>Empresa:</strong> {chamado.empresa_usuario}</div>
              <div><strong>Prioridade:</strong> {chamado.prioridade}</div>
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
              />
            </label>

            <label>
              Prioridade:
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value)}
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
              />
            </label>

            <button onClick={saveChanges}>Salvar</button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
