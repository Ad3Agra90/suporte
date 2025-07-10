import React, { useState, useEffect } from 'react';
import './Admin.css';

export default function Admin() {
  const [chamados, setChamados] = useState([]);
  // Removed duplicate declaration of users and setUsers to fix redeclaration error
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [isChamadoModalOpen, setIsChamadoModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [currentUserPermission, setCurrentUserPermission] = useState('');

  // Filter states
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterSemTecnico, setFilterSemTecnico] = useState(false);
  const [filterComTecnico, setFilterComTecnico] = useState(false);
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserPermission, setFilterUserPermission] = useState('');
  const [filterUserKeyword, setFilterUserKeyword] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchChamados();
    fetchUsers();
    const perm = localStorage.getItem('permission') || '';
    setCurrentUserPermission(perm.toLowerCase());
  }, []);

  const handleFilterChange = (overrides = {}) => {
    // Merge current filters with overrides to allow independent filter application
    const filters = {
      keyword: filterKeyword,
      semTecnico: filterSemTecnico,
      comTecnico: filterComTecnico,
      tecnico: filterTecnico,
      prioridade: filterPrioridade,
      status: filterStatus,
      ...overrides,
    };

    // Update local filter states if overrides provided
    if (Object.prototype.hasOwnProperty.call(overrides, 'keyword')) setFilterKeyword(overrides.keyword);
    if (Object.prototype.hasOwnProperty.call(overrides, 'semTecnico')) setFilterSemTecnico(overrides.semTecnico);
    if (Object.prototype.hasOwnProperty.call(overrides, 'comTecnico')) setFilterComTecnico(overrides.comTecnico);
    if (Object.prototype.hasOwnProperty.call(overrides, 'tecnico')) setFilterTecnico(overrides.tecnico);
    if (Object.prototype.hasOwnProperty.call(overrides, 'prioridade')) setFilterPrioridade(overrides.prioridade);
    if (Object.prototype.hasOwnProperty.call(overrides, 'status')) setFilterStatus(overrides.status);

    fetchChamados(filters);
  };

  const fetchChamados = async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/chamados/filter?';
      if (filters.keyword) url += `keyword=${encodeURIComponent(filters.keyword)}&`;
      if (filters.semTecnico) url += `semTecnico=true&`;
      if (filters.comTecnico) url += `comTecnico=true&`;
      if (filters.tecnico) url += `tecnico=${encodeURIComponent(filters.tecnico)}&`;
      if (filters.prioridade) url += `prioridade=${encodeURIComponent(filters.prioridade)}&`;
      if (filters.status) url += `status=${encodeURIComponent(filters.status)}&`;

      const res = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched chamados with filters:', data);
        setChamados(data);
      } else {
        console.error('Failed to fetch chamados: HTTP status', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch chamados:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        const tecnicosList = data.filter(u => u.permission && u.permission.toLowerCase() === 'tecnico');
        setTecnicos(tecnicosList);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchUsersWithFilter = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterUserPermission) params.append('permission', filterUserPermission);
      if (filterUserKeyword) params.append('keyword', filterUserKeyword);
      console.log('Fetching users with filter:', params.toString());  // Added debug log
      const res = await fetch(`/api/users/filter?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Filtered users received:', data);  // Added debug log
        setUsers(data);
        const tecnicosList = data.filter(u => u.permission && u.permission.toLowerCase() === 'tecnico');
        setTecnicos(tecnicosList);
      }
    } catch (error) {
      console.error('Failed to fetch filtered users:', error);
    }
  };

  const openChamadoModal = (chamado) => {
    if (currentUserPermission === 'master' || currentUserPermission === 'admin') {
      setSelectedChamado(chamado);
      setIsChamadoModalOpen(true);
    }
  };

  const closeChamadoModal = () => {
    setSelectedChamado(null);
    setIsChamadoModalOpen(false);
  };


  const openUserModal = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setEditedUser(null);
    setIsUserModalOpen(false);
  };

  const handleUserChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const saveUser = async () => {
    if (!editedUser) return;
    try {
      const res = await fetch(`/api/users/${editedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });
      if (res.ok) {
        // Check if password was changed and update token if returned by backend
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        await fetchUsers();
        closeUserModal();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        await fetchUsers();
        closeDeleteConfirm();
        closeUserModal();
      } else {
        const errorText = await res.text();
        alert('Delete failed: ' + errorText);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Configuração Admin</h1>
      <div className="admin-columns" style={{ flexDirection: 'column' }}>
        {/* Chamados full width */}
        <div className="admin-column chamados-column" style={{ width: '100%', marginBottom: '30px' }}>
          <h2>Chamados</h2>
          <div className="filters-container">
            <input
              type="text"
              placeholder="Buscar chamado"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFilterChange({ keyword: filterKeyword });
                }
              }}
            />
            <select value={filterPrioridade} onChange={(e) => setFilterPrioridade(e.target.value)}>
              <option value="">Prioridade</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em análise">Em análise</option>
              <option value="Fechado">Fechado</option>
            </select>
            <select value={filterTecnico} onChange={(e) => setFilterTecnico(e.target.value)}>
              <option value="">Técnico</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.username}>{tecnico.username}</option>
              ))}
            </select>
            <button onClick={() => handleFilterChange({ keyword: filterKeyword })}>Buscar</button>
            <button onClick={() => handleFilterChange({ semTecnico: false, comTecnico: false, tecnico: '', prioridade: '', status: '', keyword: '' })}>Todos</button>
            <button onClick={() => handleFilterChange({ semTecnico: false, comTecnico: false, tecnico: '', prioridade: '', status: '', keyword: '' })}>Limpar</button>
          </div>
          <div className="chamados-cards-container">
            {chamados.map(chamado => (
              <div key={chamado.id} className={`chamado-card ${currentUserPermission === 'master' ? 'clickable' : ''}`} onClick={() => openChamadoModal(chamado)}>
                <h3>{chamado.titulo || chamado.chamado || 'Sem título'}</h3>
                <p><strong>Usuário:</strong> {chamado.usuario || 'Desconhecido'}</p>
                <p><strong>Empresa:</strong> {chamado.empresaUsuario || 'Desconhecida'}</p>
                <p><strong>Previsão:</strong> {chamado.previsao ? chamado.previsao.substring(0, 10) : 'N/A'}</p>
                <p><strong>Status:</strong> {chamado.status || 'N/A'}</p>
                <p><strong>Técnico:</strong> {chamado.tecnico || 'Não atribuído'}</p>
                <p><strong>Prioridade:</strong> {chamado.prioridade || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users below chamados */}
        <div className="admin-column users-column" style={{ width: '100%' }}>
          <h2>Usuários</h2>
          <div className="filters-container users-filters">
            <input
              type="text"
              placeholder="Buscar usuário"
              value={filterUserKeyword}
              onChange={(e) => setFilterUserKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Call fetchUsersWithFilter with current input value to ensure latest state is used
                  fetchUsersWithFilter();
                }
              }}
            />
            <select value={filterUserPermission} onChange={(e) => setFilterUserPermission(e.target.value)}>
              <option value="">Permissão</option>
              <option value="admin">Admin</option>
              <option value="tecnico">Técnico</option>
              <option value="cliente">Cliente</option>
            </select>
            <button onClick={() => fetchUsersWithFilter()}>Buscar</button>
            <button onClick={() => {
              setFilterUserPermission('');
              setFilterUserKeyword('');
              fetchUsers();
            }}>Todos</button>
            <button onClick={() => {
              setFilterUserPermission(''); // No direct equivalent of "Sem Técnico" for users, so just clear filters
              setFilterUserKeyword('');
              fetchUsers();
            }}>Limpar</button>
          </div>
          <div className="users-cards-container" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {users.map(user => (
              <div key={user.id} className="user-box" onClick={() => openUserModal(user)}>
                <strong>{user.username}</strong><br />
                Empresa: {user.empresaUsuario || 'Desconhecida'}<br />
                Permissão: {user.permission || 'Desconhecida'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chamado modal */}
      {isChamadoModalOpen && selectedChamado && (
        <div className="modal-overlay" onClick={closeChamadoModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ textAlign: 'center' }}>{selectedChamado.chamado || 'Sem chamado'}</h3>
            <div className="modal-card">
              <div className="modal-section-inline">
                <div className="modal-label-left">Usuário:</div>
                <div className="modal-text-inline black-text">{selectedChamado.usuario || 'Desconhecido'}</div>
              </div>
              <div className="modal-section-inline">
                <div className="modal-label-left">Empresa:</div>
                <div className="modal-text-inline black-text">{selectedChamado.empresaUsuario || 'Desconhecida'}</div>
              </div>
            </div>
            <div className="modal-card">
              <div className="modal-label-left">Descrição:</div>
              <div className="modal-text-left">{selectedChamado.descricao}</div>
            </div>

            <div className="modal-card">
              <div className="modal-label-left">Resposta:</div>
              <div className="modal-text-left">{selectedChamado.resposta || 'Sem resposta'}</div>
            </div>

            <div className="modal-card">
              <div className="modal-section-inline" style={{gap: '10px', alignItems: 'center'}}>
                <div className="modal-label-left" style={{minWidth: '80px'}}>Previsão:</div>
                <div className="modal-text-inline">{selectedChamado.previsao ? selectedChamado.previsao.substring(0, 10) : 'N/A'}</div>
              </div>
              <div className="modal-section-inline" style={{gap: '10px', alignItems: 'center', marginTop: '12px'}}>
                <div className="modal-label-left" style={{minWidth: '80px'}}>Status:</div>
                <div className="modal-text-inline">{selectedChamado.status || 'N/A'}</div>
              </div>
            </div>

            <div className="modal-card">
              <div>
                <div className="modal-title-left">Técnico:</div>
                <div className="modal-select-centered">
                  <select
                    value={selectedChamado.tecnico || ''}
                    onChange={e => setSelectedChamado({ ...selectedChamado, tecnico: e.target.value })}
                  >
                    <option value="">Nenhum</option>
                    {tecnicos.map(tecnico => (
                      <option key={tecnico.id} value={tecnico.username}>{tecnico.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div className="modal-title-left">Prioridade:</div>
                <div className="modal-select-centered">
                  <select
                    value={selectedChamado.prioridade || ''}
                    onChange={e => setSelectedChamado({ ...selectedChamado, prioridade: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  // Log the selectedChamado before sending
                  console.log('Saving chamado:', selectedChamado);
                  const res = await fetch(`/api/chamados/${selectedChamado.id}`, {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                      ...selectedChamado,
                      tecnico: selectedChamado.tecnico || '',
                      prioridade: selectedChamado.prioridade || '',
                      resposta: selectedChamado.resposta || '',
                      previsao: selectedChamado.previsao || '',
                      status: selectedChamado.status || '',
                      descricao: selectedChamado.descricao || '',
                      empresaUsuario: selectedChamado.empresaUsuario || '',
                      usuario: selectedChamado.usuario || '',
                      chamado: selectedChamado.chamado || '',
                    }),
                  });
                  if (res.ok) {
                    await fetchChamados();
                    closeChamadoModal();
                  } else {
                    const errorText = await res.text();
                    alert('Falha ao salvar chamado: ' + errorText);
                  }
                } catch (error) {
                  console.error('Erro ao salvar chamado:', error);
                }
              }}>Salvar</button>

              <button onClick={closeChamadoModal}>Cancelar</button>

              <button className="delete-btn" onClick={async () => {
                if (!window.confirm('Tem certeza que deseja deletar este chamado?')) return;
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`/api/chamados/${selectedChamado.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : '',
                    },
                  });
                  if (res.ok) {
                    await fetchChamados();
                    closeChamadoModal();
                  } else {
                    alert('Falha ao deletar chamado');
                  }
                } catch (error) {
                  console.error('Erro ao deletar chamado:', error);
                }
              }}>Deletar</button>
            </div>
          </div>
        </div>
      )}

      {/* User modal */}
      {isUserModalOpen && editedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Editar Usuário</h3>
            <div className="modal-card">
              <label>
                Username:<br />
                <input type="text" value={editedUser.username || ''} onChange={e => handleUserChange('username', e.target.value)} />
              </label>
            </div>
            <div className="modal-card">
              <label>
                Empresa:<br />
                <input type="text" value={editedUser.empresaUsuario || ''} onChange={e => handleUserChange('empresaUsuario', e.target.value)} />
              </label>
            </div>
            <div className="modal-card">
              <label>
                Permissão:<br />
                <select value={editedUser.permission || ''} onChange={e => handleUserChange('permission', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="admin">Admin</option>
                  <option value="tecnico">Técnico</option>
                  <option value="cliente">Cliente</option>
                </select>
              </label>
            </div>
            <div className="modal-card">
              <label>
                Email:<br />
                <input type="email" value={editedUser.email || ''} onChange={e => handleUserChange('email', e.target.value)} />
              </label>
            </div>
            <div className="modal-card">
              <label>
                Redefinir senha:<br />
                <input type="password" value={editedUser.password || ''} placeholder="Digite a nova senha" onChange={e => handleUserChange('password', e.target.value)} />
              </label>
            </div>
            <button onClick={saveUser}>Salvar</button>
            <button onClick={closeUserModal}>Cancelar</button>
            <button className="delete-btn" onClick={openDeleteConfirm}>Excluir</button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este usuário?</p>
            <button onClick={deleteUser}>Sim</button>
            <button onClick={closeDeleteConfirm}>Não</button>
          </div>
        </div>
      )}
    </div>
  );
}
