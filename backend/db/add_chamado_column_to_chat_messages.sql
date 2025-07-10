-- Add chamado_id column to chat_messages table
ALTER TABLE chat_messages
ADD COLUMN chamado_id BIGINT NULL;

-- Add foreign key constraint to chamado_id referencing chamados table
ALTER TABLE chat_messages
ADD CONSTRAINT fk_chamado
FOREIGN KEY (chamado_id) REFERENCES chamados(id);
