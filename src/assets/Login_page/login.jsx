import React, { useState } from 'react'
import './style.css'

export default function Login({ onLoginSuccess }){
    const [isActive, setIsActive] = useState(false);

    // Login form state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Registration form state
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    // Forgot password state
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleRegisterClick = () => {
        setIsActive(true);
        clearMessages();
    };
    const handleLoginClick = () => {
        setIsActive(false);
        clearMessages();
    };

    const clearMessages = () => {
        setLoginError('');
        setRegError('');
        setRegSuccess('');
        setMessage('');
        setError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        clearMessages();

        if (!loginUsername || !loginPassword) {
            setLoginError('Por favor, preencha usuário e senha.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: loginUsername, password: loginPassword }),
            });

            if (response.ok) {
                const data = await response.json();
                setLoginError('');
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username || loginUsername);
                onLoginSuccess(data.token, data.username || loginUsername);
            } else {
                const errorText = await response.text();
                setLoginError(errorText || 'Credenciais inválidas.');
            }
        } catch {
            setLoginError('Erro ao conectar com o servidor.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        clearMessages();

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regUsername || !regEmail || !regPassword) {
            setRegError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (!emailRegex.test(regEmail)) {
            setRegError('O e-mail informado não é válido.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: regUsername,
                    email: regEmail,
                    password: regPassword
                }),
            });

            if (response.ok) {
                setRegSuccess('Cadastro realizado com sucesso! Você pode fazer login agora.');
                setRegError('');
                setRegUsername('');
                setRegEmail('');
                setRegPassword('');
            } else {
                const errorText = await response.text();
                setRegError(errorText || 'Erro no cadastro.');
            }
        } catch {
            setRegError('Erro ao conectar com o servidor.');
        }
    };

    const handleRequestPasswordReset = async () => {
        clearMessages();
        try {
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            if (response.ok) {
                setMessage('Email de redefinição enviado. Verifique sua caixa de entrada.');
            } else {
                const errorText = await response.text();
                setError(errorText || 'Falha ao enviar email de redefinição.');
            }
        } catch {
            setError('Erro ao conectar com o servidor.');
        }
    };

    const handleResetPassword = async () => {
        clearMessages();
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword }),
            });
            if (response.ok) {
                setMessage('Senha redefinida com sucesso.');
                setForgotPasswordMode(false);
                setResetEmail('');
                setResetToken('');
                setNewPassword('');
            } else {
                const errorText = await response.text();
                setError(errorText || 'Falha ao redefinir senha.');
            }
        } catch {
            setError('Erro ao conectar com o servidor.');
        }
    };

    return(
        <>
        <div className={`container${isActive ? ' active' : ''}`}>
            <div className="form-box login">
                <form onSubmit={handleLoginSubmit}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            required
                        />
                        <i className='bx bxs-user'></i>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                    {loginError && <p className="error-message">{loginError}</p>}
                    <div className="forgot-link">
                      <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordMode(true); }}>Esqueceu a senha?</a>
                    </div>
                    <button type="submit" className="btn">Login</button>
                </form>
            </div>

            <div className="form-box register">
                <form onSubmit={handleRegisterSubmit}>
                    <h1>Cadastre-se</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            required
                        />
                        <i className='bx bxs-user'></i>
                    </div>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                        />
                        <i className='bx bxs-envelope' ></i>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                        />
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                    {regError && <p className="error-message">{regError}</p>}
                    {regSuccess && <p className="success-message">{regSuccess}</p>}
                    <button type="submit" className="btn">Registre-se</button>
                </form>
            </div>

            <div className="toggle-box">
                <div className="toggle-panel toggle-left">
                    <h1>Olá, Seja Bem-Vindo!</h1>
                    <p>Você já tem uma conta cadastrada?</p>
                    <button className="btn register-btn" onClick={handleRegisterClick}>Cadastre-se</button>
                </div>

                <div className="toggle-panel toggle-right">
                    <h1>Bem-vindo de volta!</h1>
                    <p>Já tem uma conta cadastrada?</p>
                    <button className="btn login-btn" onClick={handleLoginClick}>Login</button>
                </div>
            </div>
        </div>
        {forgotPasswordMode && (
          <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setForgotPasswordMode(false); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Redefinir Senha</h2>
              {!resetToken ? (
                <>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <button onClick={handleRequestPasswordReset}>Enviar código</button>
                  <button onClick={() => setForgotPasswordMode(false)}>Cancelar</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Digite o código recebido"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button onClick={handleResetPassword}>Redefinir senha</button>
                  <button onClick={() => setForgotPasswordMode(false)}>Cancelar</button>
                </>
              )}
              {message && <p className="success-message">{message}</p>}
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
        )}
        </>
    )
}
