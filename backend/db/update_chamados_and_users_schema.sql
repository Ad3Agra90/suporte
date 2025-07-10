-- Rename column atendente to tecnico in chamados table
ALTER TABLE chamados CHANGE COLUMN atendente tecnico VARCHAR(255) NULL;
