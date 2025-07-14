-- SQL script to create the database schema from scratch

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    permission VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry DATE,
    _online BOOLEAN NOT NULL DEFAULT FALSE,
    empresa_usuario VARCHAR(255)
);

CREATE TABLE chamados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chamado VARCHAR(255),
    descricao VARCHAR(255),
    usuario VARCHAR(255),
    empresa_usuario VARCHAR(255),
    resposta VARCHAR(255),
    previsao DATE,
    tecnico VARCHAR(255),
    status VARCHAR(255),
    prioridade VARCHAR(255),
    CONSTRAINT fk_chamados_usuario_users_username FOREIGN KEY (usuario) REFERENCES users(username)
);

CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(255),
    receiver VARCHAR(255),
    content VARCHAR(255),
    timestamp DATETIME,
    chamado_id BIGINT,
    CONSTRAINT fk_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

CREATE TABLE smtp_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tls_enabled BOOLEAN NOT NULL
);
