# Documento de Design da Aplicação - Suporte Midiavox

**Versão:** 2.0  
**Data:** Atualizado em 2025  
**Autor(es):** Adriano Amorim Agra

## 1. Visão Geral

### 1.1 Objetivo do Documento
Descrever a arquitetura, componentes, tecnologias e decisões de design da aplicação Suporte Midiavox, com base na análise completa do código-fonte e estrutura do projeto.

### 1.2 Escopo da Aplicação
A aplicação Suporte Midiavox é uma plataforma web completa de suporte técnico que oferece:
- Sistema de autenticação seguro com JWT
- Gerenciamento de chamados de suporte
- Chat em tempo real entre usuários
- Interface administrativa para gestão de usuários e chamados
- Sistema de permissões por roles (Admin, Técnico, Cliente)
- Dashboard interativo com filtros e busca avançada

### 1.3 Definições e Siglas
| Sigla | Significado |
|-------|-------------|
| API | Interface de Programação de Aplicações |
| UI | Interface do Usuário |
| DB | Banco de Dados |
| JWT | JSON Web Token |
| BCrypt | Algoritmo de hash para senhas |
| STOMP | Protocolo de mensagens sobre WebSocket |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete |

## 2. Arquitetura da Aplicação

### 2.1 Arquitetura Geral
A aplicação segue uma arquitetura monolítica moderna com separação clara entre frontend e backend:

**Frontend:** Single Page Application (SPA) em React
- Gerenciamento de estado local com React Hooks
- Roteamento cliente-servidor com React Router
- Comunicação assíncrona com backend via REST API
- Atualizações em tempo real via WebSocket

**Backend:** API RESTful em Java Spring Boot
- Arquitetura em camadas (Controllers, Services, Repositories)
- Segurança baseada em JWT com Spring Security
- Comunicação em tempo real via WebSocket STOMP
- Persistência com Spring Data JPA

### 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Login     │  │    Home     │  │       Admin         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Chamados   │  │    Chat     │  │      Tasks          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ WebSocket (STOMP)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Spring Boot)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Controllers │  │  Services   │  │    Repositories     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Models    │  │   Config    │  │    Security         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JPA/Hibernate
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Banco de Dados (MySQL)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    User     │  │   Chamado   │  │   ChatMessage       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Componentes Principais

#### Frontend Stack:
- **React 18** com Hooks e Context API
- **React Router v6** para navegação
- **Axios** para requisições HTTP
- **@stomp/stompjs** para WebSocket
- **Vite** como build tool

#### Backend Stack:
- **Java 17** com Spring Boot 3.x
- **Spring Security** com JWT
- **Spring Data JPA** para persistência
- **WebSocket STOMP** para comunicação em tempo real
- **MySQL** como banco de dados

## 3. Design de Componentes

### 3.1 Frontend - Estrutura Detalhada

#### 3.1.1 Componente Principal (App.jsx)
- **Responsabilidade:** Gerenciamento global de autenticação e roteamento
- **Estados:** token, username, permission
- **Funcionalidades:**
  - Login/logout automático
  - Roteamento baseado em permissões
  - Persistência de sessão via localStorage

#### 3.1.2 Páginas e Componentes

| Componente | Caminho | Responsabilidade |
|------------|---------|------------------|
| Login | src/assets/Login_page/login.jsx | Autenticação de usuários |
| Header | src/assets/components/Header/Header.jsx | Navegação e logout |
| Home | src/assets/Pages/Home/Home.jsx | Dashboard inicial |
| Admin | src/assets/Pages/Admin/Admin.jsx | Gestão completa de usuários e chamados |
| Chamados | src/assets/Pages/Chamados/Chamados.jsx | Visualização de chamados |
| Chat | src/assets/Pages/Chat/Chat.jsx | Comunicação em tempo real |
| Tasks | src/assets/Pages/Tasks/Tasks.jsx | Gerenciamento de tarefas (técnicos) |
| Settings | src/assets/Pages/Configurações/Settings.jsx | Configurações administrativas |

#### 3.1.3 Admin.jsx - Funcionalidades Detalhadas
- **Gestão de Chamados:**
  - Visualização em cards com filtros dinâmicos
  - Atribuição de técnicos
  - Alteração de status e prioridade
  - Exclusão de chamados
  - Atualizações em tempo real via WebSocket

- **Gestão de Usuários:**
  - CRUD completo de usuários
  - Atribuição de permissões (admin, técnico, cliente)
  - Filtros por permissão e busca por nome
  - Cadastro de novos usuários

### 3.2 Backend - Estrutura Detalhada

#### 3.2.1 Controladores REST

**AuthController.java**
- POST /api/auth/register - Registro de novos usuários
- POST /api/auth/login - Autenticação e geração de JWT
- POST /api/auth/logout - Logout e invalidação de token
- POST /api/auth/reset-password - Recuperação de senha

**ChamadoController.java**
- GET /api/chamados - Listar chamados do usuário autenticado
- GET /api/chamados/all - Listar todos os chamados (admin)
- GET /api/chamados/kanban - Listar para visualização Kanban
- POST /api/chamados - Criar novo chamado
- PUT /api/chamados/{id} - Atualizar chamado existente
- DELETE /api/chamados/{id} - Excluir chamado
- GET /api/chamados/filter - Filtrar chamados com parâmetros

**UserController.java**
- GET /api/users - Listar todos os usuários
- GET /api/users/{id} - Buscar usuário específico
- PUT /api/users/{id} - Atualizar usuário
- DELETE /api/users/{id} - Excluir usuário
- GET /api/users/filter - Filtrar usuários

#### 3.2.2 Modelos de Dados

**User.java**
```java
- id: Long (chave primária)
- username: String (único)
- email: String (único)
- password: String (hash BCrypt)
- permission: String (admin, tecnico, cliente)
- empresaUsuario: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

**Chamado.java**
```java
- id: Long (chave primária)
- titulo: String
- descricao: String
- status: String (Aberto, Em análise, Fechado)
- prioridade: String (Baixa, Média, Alta)
- tecnico: String (username do técnico)
- usuario: String (username do criador)
- resposta: String
- previsao: LocalDate
- empresaUsuario: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

**ChatMessage.java**
```java
- id: Long (chave primária)
- sender: String
- content: String
- timestamp: LocalDateTime
- chamadoId: Long (relacionamento)
```

### 3.3 Banco de Dados

#### 3.3.1 Estrutura das Tabelas

**Tabela users**
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    permission VARCHAR(50) DEFAULT 'cliente',
    empresa_usuario VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tabela chamados**
```sql
CREATE TABLE chamados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'Aberto',
    prioridade VARCHAR(50),
    tecnico VARCHAR(255),
    usuario VARCHAR(255),
    resposta TEXT,
    previsao DATE,
    empresa_usuario VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES users(username)
);
```

## 4. Design da Interface (UI/UX)

### 4.1 Fluxo de Navegação

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Login  │────▶│  Home   │────▶│ Chamados│
└─────────┘     └─────────┘     └─────────┘
                      │                 │
                      ▼                 ▼
               ┌─────────┐     ┌─────────┐
               │   Chat  │     │  Admin  │
               └─────────┘     └─────────┘
                                    │
                                    ▼
                              ┌─────────┐
                              │ Settings│
                              └─────────┘
```

### 4.2 Padrões de UI

#### 4.2.1 Cores e Estilos
- **Cabeçalho:** #151F28 (azul escuro)
- **Indicador ativo:** #4bfc6e (verde vibrante)
- **Botões primários:** #2e9108 (verde escuro)
- **Botões secundários:** #61dafb (azul claro)
- **Fundo da página de login:** gradiente linear de #e2e2e2 para #d4ffc9

#### 4.2.2 Tipografia
- Fonte global: "Inter", sans-serif
- Cabeçalhos: "Poppins", sans-serif
- Formulários: "Poppins", sans-serif

#### 4.2.3 Componentização
- Botões com cantos arredondados e sombra leve
- Inputs com fundo cinza claro (#eee) e bordas arredondadas
- Layout responsivo para telas menores com ajustes em formulários e painéis

## 5. Requisitos Não Funcionais

- Performance: Tempo de resposta até 2 segundos
- Segurança: Criptografia de senhas com BCrypt, autenticação via JWT com expiração de 1 dia
- Escalabilidade: Arquitetura preparada para crescimento, porém monolítica
- Manutenibilidade: Código modularizado, uso de React para frontend e Spring Boot para backend

## 6. Estratégia de Integração e Implantação

- Ambientes: Desenvolvimento, Homologação, Produção (não detalhados)
- CI/CD: Não especificado no projeto atual
- Deploy: Não especificado no projeto atual

## 7. Riscos e Mitigações

Risco

Impacto

Mitigação

API de terceiros fora do ar

-

-

Falha de autenticação

-

-

## 8. Considerações Finais

O projeto Suporte Midiavox apresenta uma arquitetura clara e modular, com foco em autenticação segura e interface amigável. Próximas etapas incluem a implementação de testes automatizados, melhorias na interface e definição da estratégia de implantação.
