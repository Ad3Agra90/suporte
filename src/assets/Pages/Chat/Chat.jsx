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
  const [supportUsers, setSupportUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClient = useRef(null);

  // Fetch users from backend API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await fetch('/api/users/all', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'same-origin',
      });
      if (response.ok) {
        let data = await response.json();
        // Filter out the logged-in user from the support users list
        data = data.filter(user => user.username !== username);
        setSupportUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

    useEffect(() => {
    // Setup WebSocket connection to backend server on port 8080
    // Append token as query param for WebSocket handshake
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
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
          // Append all messages to state for real-time update
          setMessages((prev) => [...prev, msg]);
        });
        stompClient.current.subscribe('/topic/onlineUsers', (message) => {
          const onlineUsers = JSON.parse(message.body);
          setSupportUsers((prevUsers) =>
            prevUsers.map((user) => ({
              ...user,
              online: onlineUsers.includes(user.username),
            }))
          );
        });
      },
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    stompClient.current.activate();

    // Poll every 5 seconds for user list update fallback
    const interval = setInterval(fetchUsers, 5000);

    // Removed WebSocket deactivation on window unload to keep user online during tab switches
    // const handleUnload = async () => {
    //   if (stompClient.current && stompClient.current.connected) {
    //     stompClient.current.deactivate();
    //   }
    // };
    // window.addEventListener('beforeunload', handleUnload);

    return () => {
      // if (stompClient.current) {
      //   stompClient.current.deactivate();
      // }
      clearInterval(interval);
      // window.removeEventListener('beforeunload', handleUnload);
    };
  }, []); // Removed selectedUser dependency to keep subscription active

  // Filter messages for display based on selectedUser
  const filteredMessages = messages.filter((msg) => {
    if (!selectedUser) return false;
    const username = localStorage.getItem('username');
    return (
      (msg.sender === username && msg.receiver === selectedUser.username) ||
      (msg.receiver === username && msg.sender === selectedUser.username)
    );
  });

  // Debug: log messages state on update
  React.useEffect(() => {
    console.log('Messages state updated:', messages);
  }, [messages]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    // Fetch chat history from backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/history?user1=${localStorage.getItem('username')}&user2=${user.username}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setMessages([]);
    }
  };

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
    if (!selectedUser?.online) {
      openModal('Atendente Offline');
      setInput('');
      return;
    }
    if (input.trim() && selectedUser && stompClient.current && stompClient.current.connected) {
      const newMessage = {
        content: input.trim(),
        sender: localStorage.getItem('username'),
        receiver: selectedUser.username,
        // Remove timestamp, backend sets it
        // timestamp: new Date().toLocaleTimeString(),
      };
      console.log('Sending message:', newMessage);
      stompClient.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(newMessage),
      });
      // Do not add message here, wait for server broadcast to update messages
      setInput('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(input + emoji);
  };

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
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.deactivate();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    const chatMessagesDiv = document.querySelector('.chat-messages');
    if (chatMessagesDiv) {
      chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="chat-wrapper">
        <div className="support-list">
          <h3>Suporte Online</h3>
          <ul>
            {supportUsers.map((user) => (
              <li
                key={user.id}
                className={user.online ? 'online' : 'offline'}
                onClick={() => handleUserSelect(user)}
                style={{ cursor: 'pointer', fontWeight: selectedUser?.id === user.id ? 'bold' : 'normal' }}
              >
                <span className={user.online ? 'status-dot online' : 'status-dot offline'}></span>&nbsp;{user.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-main">
          {selectedUser ? (
            <>
              <div className="chat-header">
                Conversa com {selectedUser.username}
              </div>
              <div className="chat-messages">
                {messages.length === 0 && <p className="no-messages">Nenhuma mensagem ainda.</p>}
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
                <div ref={messagesEndRef} />
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
              Selecione um usuário de suporte para iniciar a conversa.
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
