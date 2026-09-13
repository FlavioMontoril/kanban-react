# Aplicativo React Kanban

Uma aplicação de quadro Kanban rica em recursos, construída com React, Vite, TypeScript e Tailwind CSS. O sistema foi projetado para funcionar perfeitamente com um backend (como Spring Boot), e conta com atualizações em tempo real, múltiplos modos de visualização e filtragem avançada de tarefas.

## Funcionalidades

- **📋 Quadro Kanban Interativo:** Gerencie tarefas com uma funcionalidade suave de Arrastar e Soltar (Drag & Drop) utilizando `@hello-pangea/dnd`.
- **🗂️ Múltiplas Visualizações:** Alterne entre as visões de Kanban, Tabela e Fluxos (Workflows) para visualizar suas tarefas e seus históricos da maneira que preferir (usando `@xyflow/react`).
- **🔄 Atualizações em Tempo Real:** Sincronização instantânea entre diversos clientes usando WebSockets (`@stomp/stompjs` e `sockjs-client`).
- **🎨 Interface Moderna e Responsiva:** Criada com Tailwind CSS e componentes do Shadcn UI, proporcionando uma experiência visual premium e acessível.
- **🌓 Modo Claro/Escuro:** Alternância de temas nativa para uma melhor experiência do usuário.
- **🔍 Filtragem Avançada:** Encontre tarefas de forma rápida através de busca por texto, dropdown de status e seleção de intervalos de datas.
- **🐻 Gerenciamento de Estado:** Gerenciamento eficiente e escalável no lado do cliente usando o Zustand.
- **🔔 Notificações:** Sistema de alertas (toast notifications) para ações e atualizações utilizando a biblioteca `sonner`.

## Tecnologias Utilizadas

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Drag and Drop:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Fluxos/Diagramas:** [React Flow (@xyflow/react)](https://reactflow.dev/)
- **WebSockets:** [STOMP.js](https://stomp-js.github.io/) + SockJS
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **Manipulação de Datas:** [date-fns](https://date-fns.org/)

## Começando

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina, juntamente com o [pnpm](https://pnpm.io/) como gerenciador de pacotes.

```bash
npm install -g pnpm
```

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd react-kanbam
   ```

2. **Instale as dependências:**

   ```bash
   pnpm install
   ```

3. **Configuração de Ambiente:**

   Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example` fornecido:

   ```bash
   cp .env.example .env
   ```

   Atualize o arquivo `.env` ajustando a variável `VITE_API_BASE_URL` para apontar para o seu backend.

### Rodando a Aplicação

Inicie o servidor de desenvolvimento (que possui Hot Module Replacement - HMR):

```bash
pnpm run dev
```

A aplicação estará disponível no seu ambiente local (geralmente em `http://localhost:5173`).

## Suporte ao Docker

Você pode facilmente rodar a aplicação utilizando Docker e Docker Compose. O projeto usa um sistema de *multi-stage build* no `Dockerfile` para gerar o build da aplicação e servi-la através do Nginx (`nginx.conf`).

Inicie o container:

```bash
docker-compose up -d --build
```

A aplicação será mapeada para a porta `8082` da sua máquina, estando acessível em `http://localhost:8082`.

## Scripts Disponíveis

- `pnpm run dev`: Inicia o servidor de desenvolvimento do Vite.
- `pnpm run build`: Compila o TypeScript e gera o build de produção na pasta `dist`.
- `pnpm run lint`: Roda o ESLint para encontrar problemas de qualidade ou formatação de código.
- `pnpm run preview`: Roda uma pré-visualização local do build de produção.
