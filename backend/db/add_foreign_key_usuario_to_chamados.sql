-- Add foreign key constraint to link chamados.usuario to users.username
ALTER TABLE chamados
  ADD CONSTRAINT fk_chamados_usuario_users_username
  FOREIGN KEY (usuario) REFERENCES users(username);
