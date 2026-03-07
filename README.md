# Gymhub

Aplicação frontend para gerenciamento de academias, utilizando React e TailwindCSS.

## Requisitos

- Node.js 18+
- npm ou yarn

## Configuração e Desenvolvimento

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd gymhub
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O servidor será iniciado em `http://localhost:3000`.

## Métodos Alternativos de Desenvolvimento

### Usando GitHub Codespaces

1. Acesse a página principal do repositório no GitHub.
2. Clique no botão "Code" e selecione a aba "Codespaces".
3. Crie um novo Codespace para iniciar um ambiente de desenvolvimento remoto.

### Editando Diretamente no GitHub

1. Navegue até o arquivo desejado no repositório.
2. Clique no botão de edição (ícone de lápis).
3. Faça suas alterações e confirme o commit.

## Como editar o código?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.


## Docker (Ambiente Local)

Arquivos adicionados:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`

### Configurar variaveis

```bash
cp .env.example .env
```

### Subir frontend

```bash
docker compose up --build
```

Frontend disponivel em:
- `http://localhost:5173`

Por padrao, o frontend usa:
- `VITE_API_URL=http://localhost:3000/api`

### Encerrar

```bash
docker compose down
```

## Comunicacao com o Backend

A aplicacao usa o hook `useLocalStorageCrud` como fachada de dados,
mas agora ele faz chamadas HTTP para o backend (`VITE_API_URL`).

Recursos consumidos:
- `/students`
- `/teachers`
- `/courses`
- `/classes`
- `/checkins`

Defina em `.env` (frontend):

```env
VITE_API_URL=http://localhost:3300/api
```

## Autenticacao E Permissoes

Fluxo implementado:
- Login com email ou CPF
- JWT armazenado em `gymhub:auth:token`
- Contexto global em `src/contexts/AuthContext.tsx`
- Guardas de rota:
  - `AuthGuard`
  - `PermissionGuard`
- Paginas de auth:
  - `/auth/login`
  - `/auth/forgot-password`
  - `/auth/reset-password`
- CRUD de usuarios:
  - `/users`

Credencial padrao (dev), apos `npm run auth:bootstrap` no backend:
- email: `admin@gymhub.local`
- senha: `Admin@123`
