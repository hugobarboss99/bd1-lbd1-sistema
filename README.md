# Trabalho Prático 1 da disciplina de Banco de Dados I
Integrantes: Gustavo de Assis, Hugo Barbosa, Thamiris Soares, João Pedro

# AutoTroca

Sistema de marketplace de veículos usados, desenvolvido como trabalho da
disciplina de Banco de Dados. Permite que usuários cadastrem veículos,
criem anúncios, comprem veículos anunciados por outros usuários, e que
administradores gerenciem usuários e anúncios da plataforma.

## Stack utilizada

- **Frontend:** React (criado com Vite)
- **Backend:** Python + FastAPI
- **Banco de dados:** Oracle Cloud (Autonomous Database)
- **Autenticação:** JWT (JSON Web Token)
- **Driver de conexão com o banco:** python-oracledb

## Estrutura do repositório

```
SISTEMA/
├── backend/        → API REST em Python/FastAPI
└── frontend/        → Interface web em React
```

Backend e frontend são projetos **independentes**: rodam em processos e
portas diferentes, e se comunicam apenas via requisições HTTP (JSON). 

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior) — para o frontend
- [Python](https://www.python.org/) (versão 3.10 ou superior) — para o backend
- Acesso ao Oracle Autonomous Database, com o arquivo de
  Wallet (`.zip`) baixado do painel da Oracle Cloud

---

## Configurando o Backend

### 1. Entrar na pasta e criar ambiente virtual (recomendado)

```bash
cd backend
python -m venv venv

# Ativar o ambiente virtual:
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar a Wallet do Oracle

Extraia o arquivo `Wallet_NOMEDOBANCO.zip` (baixado do painel da Oracle
Cloud) dentro da pasta `backend/wallet/`. A estrutura deve ficar assim:

```
backend/wallet/
├── cwallet.sso
├── tnsnames.ora
├── sqlnet.ora
└── ...
```

### 4. Criar o arquivo de variáveis de ambiente

Crie um arquivo `backend/.env`

```
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DSN=nome_do_servico_no_tnsnames
JWT_SECRET=uma_chave_secreta_qualquer_para_assinar_os_tokens
```

> O `DB_DSN` é o nome do serviço (ex: `meubanco_high`) encontrado dentro
> do arquivo `tnsnames.ora`, na pasta da wallet.

### 5. Rodar o servidor

```bash
uvicorn app.main:app --reload --port 8000
```

A API estará disponível em `http://localhost:8000`. A documentação
automática (gerada pelo FastAPI) pode ser acessada em
`http://localhost:8000/docs`.

---

## Configurando o Frontend

### 1. Entrar na pasta e instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar a URL da API

No arquivo `src/api/config.js`, confirme que a URL base aponta para o
backend local:

```javascript
export const API_BASE_URL = "http://localhost:8000";
```

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (porta padrão do
Vite).

---

## Rodando o projeto completo

É necessário ter **dois terminais abertos simultaneamente**:

```bash
# Terminal 1
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend
npm run dev
```

---
