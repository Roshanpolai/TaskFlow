# TaskFlow — Modern Kanban Project Management Application

TaskFlow is a SaaS-style project management and Kanban application built with **Angular 21**, **TypeScript**, **Angular CDK Drag-and-Drop**, and pure modern **CSS3**.

---

## 🌟 Key Features

### 1. Kanban Board & Angular CDK Drag-and-Drop
- Three dynamic columns: **To Do**, **In Progress**, and **Done**.
- Smooth drag-and-drop between all columns and reordering within columns.
- Realistic drag previews with slight elevation, dashed drop placeholders, and animated drops.
- Supports both mouse and touch input.
- Seamless synchronization with active search queries and filters without data loss.

### 2. Full Task Management & CRUD Operations
- **Create**: Add new tasks with title, description, column status, priority (Low, Medium, High), assignee, and due date.
- **View / Edit**: Click any task card to open the detailed Task Modal.
- **Delete with Safety**: Confirmation dialog to prevent accidental deletion.
- **Validation**: Title is required (up to 120 chars), input length limits, clear real-time error messages, and disabled invalid submissions.
- **Unsaved Changes Guard**: Warns users before discarding modified modal forms.

### 3. Dynamic Dashboard Analytics & Stats
- Dynamic summary cards:
  - **Total Tasks**
  - **Tasks In Progress** (with percentage calculation)
  - **Completed Tasks** (with completion rate calculation)
  - **Overdue Tasks** (dynamically identified when `dueDate < today` and `status !== 'done'`)
- Quick interactive filtering: clicking stat cards filters the board to that status immediately.

### 4. Search & Multi-criteria Filtering
- Real-time search across task titles and descriptions.
- Filter by priority: All, High, Medium, Low.
- Filter by assignee (team members with distinct roles and avatars).
- Filter by status tabs (All, To Do, In Progress, Done).
- Interactive "Clear Filters" button showing the number of matching tasks vs total.

### 5. Resilient LocalStorage Persistence
- All task state is persisted to `localStorage` under `taskflow_tasks_v2`.
- Corrupt/invalid JSON or empty storage is gracefully detected and safely initialized with realistic software engineering sprint tasks.
- Dedicated **Reset Demo Data** action with safety confirmation dialog.

### 6. Design System & Theming
- Modern SaaS aesthetic: Crisp white/slate surfaces with indigo/purple accents.
- Full Light and Dark themes with animated toggle and `localStorage` persistence.
- Interactive Toast notification system for CRUD feedback (success, info, warning, danger).
- Fully responsive across desktop, tablet, and mobile with a slide-out drawer sidebar.

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── models/
│   │   └── task.model.ts              # TypeScript interfaces, types, initial demo data
│   ├── services/
│   │   ├── task.service.ts            # Central signal-based state, persistence, CRUD, CDK reorder
│   │   ├── task.service.spec.ts       # Unit test suite for task service & persistence
│   │   ├── theme.service.ts           # Light/dark theme toggle and persistence
│   │   └── toast.service.ts           # Reactive toast messaging service
│   ├── components/
│   │   ├── header/                    # Top navbar, search, filters, theme toggle, Add Task
│   │   ├── sidebar/                   # Branding, workspace navigation, team members, reset action
│   │   ├── dashboard-stats/           # Dynamic metric summary cards
│   │   ├── kanban-board/              # 3-column drag-and-drop board with empty states
│   │   ├── task-card/                 # Task presentation, priority & overdue badges, quick actions
│   │   ├── task-modal/                # Reactive form modal for creating/editing with dirty check
│   │   ├── confirmation-dialog/       # Reusable accessible confirmation dialog
│   │   └── toast/                     # Floating toast notifications host
│   ├── app.ts                         # Root application component orchestrating state
│   ├── app.html                       # Responsive layout structure
│   ├── app.css                        # Layout rules and responsive media queries
│   └── app.spec.ts                    # Root component unit tests
├── index.html                         # Typography imports (Inter, Plus Jakarta Sans)
└── styles.css                         # CSS variables, theme tokens, CDK drag classes, resets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.19.0 or higher / v20+ / v22+)
- `bun` or `npm`

### Installation
Dependencies are already installed. If installing on a new machine:
```bash
bun install
# or
npm install
```

### Running the Development Server
```bash
bun run start
# or
ng serve
```
Open your browser and navigate to `http://localhost:4200/`.

### Building for Production
```bash
bun run build
# or
ng build
```
Build artifacts will be compiled into the `dist/taskflow` directory.

### Running Unit Tests
```bash
bun run test -- --watch=false
# or
ng test --watch=false
```
All 14 unit test specs across the application and service layer will execute with Vitest.
