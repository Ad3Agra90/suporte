-- Insert master user with username 'master', password 'midiavox' (BCrypt hashed), and permission 'master'

INSERT INTO users (username, email, password, empresa_usuario, online, permission)
VALUES (
  'master',
  'master@example.com',
  '$2a$10$7QJ6vQ6XQ6vQ6XQ6vQ6XQO6XQ6vQ6XQ6vQ6XQ6vQ6XQ6vQ6XQ6vQ6', -- bcrypt hash for 'midiavox'
  'MasterCompany',
  false,
  'master'
);
