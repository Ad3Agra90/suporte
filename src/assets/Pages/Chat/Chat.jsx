import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './Chat.css';

const EmojiPicker = ({ onSelect }) => {
  const emojis = ['😀', '😂', '😍', '😎', '😢', '👍', '🙏', '🎉'];
  return (
    <select onChange={(e) => onSelect(e.target.value)} defaultValue="">
      <option value="" disabled>😊 Emojis</option>
      {emojis.map((emoji, idx) => (
        <option key={idx} value={emoji}>{emoji}</option>
      ))}
    </select>
  );
};

export default function Chat() {
  const [chamados, setChamados] = useState([]);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userPermission, setUserPermission] = useState('');
  const stompClient = useRef(null);

  const loggedInUser = localStorage.getItem('username');

  // Fetch user permission
  const fetchUserPermission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPermission(data.permission);
      }
    } catch (error) {
      console.error('Failed to fetch user permission:', error);
    }
  };

  // Fetch chamados for chat based on user role
  const fetchChamadosForChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/chamados', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChamados(data);
      }
    } catch (error) {
      console.error('Failed to fetch chamados for chat:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserPermission();
      await fetchChamadosForChat();
    };
    fetchData();
  }, []);

  // New: Periodically fetch online status from backend API
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      if (chamados.length === 0) return;
      try {
        const token = localStorage.getItem('token');
        const usernames = [];
        chamados.forEach(chamado => {
          if (chamado.tecnico) usernames.push(chamado.tecnico);
          if (chamado.usuario) usernames.push(chamado.usuario);
        });
        // Remove duplicates
        const uniqueUsernames = [...new Set(usernames)];
        const response = await fetch(`/api/chat/onlineStatus?usernames=${uniqueUsernames.join(',')}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (response.ok) {
          const statusMap = await response.json();
          setChamados(prevChamados =>
            prevChamados.map(chamado => ({
              ...chamado,
              tecnicoOnline: statusMap[chamado.tecnico] || false,
              usuarioOnline: statusMap[chamado.usuario] || false,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch online status:', error);
      }
    };

    fetchOnlineStatus();
    const interval = setInterval(fetchOnlineStatus, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [chamados]);

  useEffect(() => {
    // Setup WebSocket connection to backend server on port 8080
    // Append token as query param for WebSocket handshake
    const token = localStorage.getItem('token');
    const socketUrl = token ? `http://localhost:8080/ws-chat?token=${token}` : 'http://localhost:8080/ws-chat';
    const socket = new SockJS(socketUrl);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        // Subscribe to user-specific message queue
        stompClient.current.subscribe('/user/queue/messages', (message) => {
          const msg = JSON.parse(message.body);
          console.log('Received message via WebSocket:', msg);
          setMessages((prev) => [...prev, msg]);
        });
        // Removed subscription to /topic/onlineUsers to avoid status changes on navigation
      },
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    stompClient.current.activate();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  // Fetch online status for technician and client of selected chamado
  const [onlineStatus, setOnlineStatus] = useState({ tecnico: false, cliente: false });

  const fetchOnlineStatus = async (tecnico, cliente) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/onlineStatus?usernames=${tecnico},${cliente}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const statusMap = await response.json();
        setOnlineStatus({
          tecnico: statusMap[tecnico] || false,
          cliente: statusMap[cliente] || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch online status:', error);
    }
  };

  const handleChamadoSelect = async (chamado) => {
    setSelectedChamado(chamado);
    await fetchOnlineStatus(chamado.tecnico, chamado.usuario);
    // Fetch chat history between tecnico and usuario filtered by chamado id
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/history?user1=${chamado.tecnico}&user2=${chamado.usuario}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter messages by chamado id if message has chamadoId field
        const filteredMessages = data.filter(msg => msg.chamadoId === chamado.id);
        setMessages(filteredMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setMessages([]);
    }
  };

  const filteredMessages = messages;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');

  const openModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMessage('');
  };

  const handleSendMessage = () => {
    if (!selectedChamado) {
      openModal('Selecione um chamado para iniciar a conversa.');
      return;
    }
    if (!onlineStatus.tecnico) {
      openModal('Técnico está offline.');
      return;
    }
    if (!onlineStatus.cliente && loggedInUser !== selectedChamado.usuario) {
      openModal('Cliente está offline.');
      return;
    }
    if (input.trim() && stompClient.current && stompClient.current.connected) {
      const newMessage = {
        content: input.trim(),
        sender: localStorage.getItem('username'),
        receiver: selectedChamado.tecnico === localStorage.getItem('username') ? selectedChamado.usuario : selectedChamado.tecnico,
        chamadoId: selectedChamado.id,
      };
      console.log('Sending message:', newMessage);
      stompClient.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(newMessage),
      });
      setInput('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(input + emoji);
  };

  return (
    <>
      <div className="chat-wrapper">
        <div className="support-list">
          <h3>Chamados</h3>
          <ul>
          {(userPermission && userPermission.toLowerCase() === 'admin') ? chamados.filter(chamado => chamado.status.toLowerCase() === 'aberto') || chamados.filter(chamado => chamado.status.toLowerCase() === 'fechado') || chamados.filter(chamado => chamado.status.toLowerCase() === 'em análise') : chamados.filter(chamado => chamado.status.toLowerCase() !== 'fechado').map((chamado) => (
            <li
              key={chamado.id}
              onClick={() => handleChamadoSelect(chamado)}
              style={{
                cursor: 'pointer',
                fontWeight: selectedChamado?.id === chamado.id ? 'bold' : 'normal',
                padding: '10px',
                border: '1px solid #ccc',
                marginBottom: '8px',
                borderRadius: '6px',
                listStyleType: 'none',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{chamado.chamado}</div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: chamado.tecnico && chamado.tecnicoOnline ? 'green' : 'red',
                    display: 'inline-block',
                    marginRight: '8px',
                  }}
                  title={chamado.tecnico && chamado.tecnicoOnline ? 'Online' : 'Offline'}
                ></span>
                <span>Técnico: {chamado.tecnico}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: chamado.usuario === loggedInUser ? 'green' : (chamado.usuario && chamado.usuarioOnline ? 'green' : 'red'),
                    display: 'inline-block',
                    marginRight: '8px',
                  }}
                  title={chamado.usuario === loggedInUser ? 'Online' : (chamado.usuario && chamado.usuarioOnline ? 'Online' : 'Offline')}
                ></span>
                <span>Cliente: {chamado.usuario}</span>
              </div>
            </li>
          ))}
          </ul>
        </div>
        <div className="chat-main">
          {selectedChamado ? (
            <>
              <div className="chat-header">
                Conversa do Chamado {selectedChamado.chamado}
              </div>
              <div className="chat-messages">
                {filteredMessages.length === 0 && <p className="no-messages">Nenhuma mensagem ainda.</p>}
                {filteredMessages.map((msg, index) => {
                  const isSentByUser = msg.sender === localStorage.getItem('username');
                  return (
                    <div
                      key={index}
                      className={`chat-message ${isSentByUser ? 'support' : 'client'}`}
                    >
                      <span className="message-content">{msg.content}</span>
                      <div className="message-timestamp">
                        {new Date(msg.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}{' '}
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chat-input-area">
                <EmojiPicker onSelect={handleEmojiSelect} />
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={!input.trim()}>Enviar</button>
              </div>
            </>
          ) : (
            <div className="no-user-selected">
              Selecione um chamado para iniciar a conversa.
            </div>
          )}
        </div>
      </div>
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
