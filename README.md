# PizzaTask

A simple, collaborative Kanban board app built with **Svelte** and backed by PizzaBase.

## Features

- **Unauthenticated & Collaborative**: Anyone can create projects, tasks, and users
- **Flexible Kanban Boards**: Default columns (todo, doing, done) that can be customized
- **Task Management**: Create tasks with title, description, assignee, and due dates
- **User Mentions**: Simple @username system for filtering tasks by assignee
- **Project-Based Organization**: Multiple projects with their own boards
- **Dark Mode**: Toggle between light and dark themes
- **Serverless**: Direct connection to PizzaBase - no backend needed!

## Tech Stack

- **Frontend**: Svelte 4 + Vite
- **Database**: PizzaBase (database-as-a-service)
- **Design**: Following PizzaBase design guide (Supabase + Anthropic + Notion inspired)

No backend server needed - the Svelte app talks directly to PizzaBase!

## Database Schema

The app uses four main tables:

- **users**: User accounts with simple usernames
- **projects**: Kanban projects with name and description
- **columns**: Customizable columns per project (default: todo, doing, done)
- **tasks**: Individual tasks with project, column, title, description, assignee, and due date

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PizzaBase account with API credentials

### Setup

1. Clone the repository:
   ```bash
   cd pizzatasks
   ```

2. Configure environment variables in `.env`:
   ```
   BASE_URL="your-pizzabase-url"
   API_KEY="your-pizzabase-api-key"
   ```

3. Initialize the database schema:
   ```bash
   chmod +x init-db.sh
   ./init-db.sh
   ```

4. Install dependencies:
   ```bash
   bun install
   cd client && bun install && cd ..
   ```

5. Start the backend server:
   ```bash
   bun run dev
   ```

6. In a new terminal, start the Svelte dev server:
   ```bash
   cd client
   bun run dev
   ```

7. Open your browser to `http:Backend dependencies
├── init-db.sh             # Database schema initialization script
├── src/
│   ├── db.ts              # PizzaBase database library
│   └── server.ts          # Bun HTTP server with API routes
├── client/                # Svelte frontend
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── src/
│   │   ├── App.svelte     # Main app component with routing
│   │   ├── main.js        # Entry point
│   │   ├── app.css        # Global styles
│   │   └── lib/
│   │       ├── api.js     # API client and stores
│   │       ├── Nav.svelte # Navigation component
│   │       ├── ProjectsPage.svelte # Project gallery
│   │       ├── ProjectBoard.svelte # Kanban board
│   │       ├── Column.svelte      # Board column
│   │       ├── TaskCard.svelte    # Task card
│   │       └── Modal.svelte       # Reusable modal
│   └── index.html
└── public/                # Old vanilla JS version (deprecated)
│   ├── db.ts              # PizzaBase database library
│   └── server.ts          # Bun HTTP server with API routes
└── public/
    ├── index.html         # Home page (project gallery)
    ├── project.html       # Project board view
    ├── styles.css         # Design system styles
    └── app.js             # Home page JavaScript
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project with columns and tasks
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:id/tasks` - List tasks for a project
- `POST /api/projects/:id/tasks` - Create a task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a user

### Columns
- `GET /api/projects/:id/columns` - List columns for a project
- `POST /api/projects/:id/columns` - Create a column
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column

## Design Philosophy

PizzaTask follows the PizzaBase design guide:

- **Content First**: Clean, minimal UI that emphasizes the data
- **Generous Whitespace**: Breathing room inspired by Anthropic
- **Developer Trust**: Professional, reliable interface like Supabase
- **Yellow-Green Primary**: Warm, inviting basil/olive oil color theme
- **Plus Jakarta Sans**: Soft, geometric typography

## License

MIT
