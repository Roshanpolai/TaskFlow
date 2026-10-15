export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  order: number;
}

export interface TaskFilter {
  search: string;
  priority: 'all' | TaskPriority;
  assigneeId: 'all' | string;
  status: 'all' | TaskStatus;
}

export interface TaskStats {
  total: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  badgeColor: string;
  dotColor: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', badgeColor: 'var(--status-todo-bg)', dotColor: 'var(--status-todo)' },
  { id: 'in-progress', title: 'In Progress', badgeColor: 'var(--status-progress-bg)', dotColor: 'var(--status-progress)' },
  { id: 'done', title: 'Done', badgeColor: 'var(--status-done-bg)', dotColor: 'var(--status-done)' }
];

export const DEFAULT_ASSIGNEES: Assignee[] = [
  { id: 'usr-1', name: 'Alex Rivera', initials: 'AR', avatarBg: '#6366f1', role: 'Frontend Lead' },
  { id: 'usr-2', name: 'Sarah Chen', initials: 'SC', avatarBg: '#ec4899', role: 'Product Designer' },
  { id: 'usr-3', name: 'Marcus Vance', initials: 'MV', avatarBg: '#06b6d4', role: 'Backend Architect' },
  { id: 'usr-4', name: 'Elena Rostova', initials: 'ER', avatarBg: '#10b981', role: 'QA Engineer' },
  { id: 'usr-5', name: 'David Kim', initials: 'DK', avatarBg: '#f59e0b', role: 'DevOps Lead' }
];

// Helper to generate dynamic relative dates for initial demo tasks
const getOffsetDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design System Component Tokens & Dark Mode Palette',
    description: 'Establish unified design tokens for color, typography, elevation, and component border radiuses across both light and dark modes.',
    status: 'in-progress',
    priority: 'high',
    assignee: DEFAULT_ASSIGNEES[1], // Sarah Chen
    dueDate: getOffsetDate(1), // Tomorrow
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    order: 0
  },
  {
    id: 'task-2',
    title: 'Implement User Authentication Flow with OAuth2',
    description: 'Implement JWT token refresh mechanism, session persistence, and social login redirects with Google and GitHub.',
    status: 'in-progress',
    priority: 'high',
    assignee: DEFAULT_ASSIGNEES[0], // Alex Rivera
    dueDate: getOffsetDate(2),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    order: 1
  },
  {
    id: 'task-3',
    title: 'Optimize Database Indexing & Query Latency',
    description: 'Analyze slow query logs in PostgreSQL, add composite indices for frequent join operations, and configure connection pooling.',
    status: 'todo',
    priority: 'medium',
    assignee: DEFAULT_ASSIGNEES[2], // Marcus Vance
    dueDate: getOffsetDate(4),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    order: 0
  },
  {
    id: 'task-4',
    title: 'Refactor State Management & Signals Architecture',
    description: 'Migrate legacy imperative subscriptions to modern Angular signals and computed expressions for predictable state updates.',
    status: 'todo',
    priority: 'high',
    assignee: DEFAULT_ASSIGNEES[0], // Alex Rivera
    dueDate: getOffsetDate(-2), // 2 days overdue!
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    order: 1
  },
  {
    id: 'task-5',
    title: 'Revamp Mobile Dashboard Navigation & Touch Gestures',
    description: 'Add swipeable bottom sheets, sticky header with backdrop filter, and smooth drawer menu animations on touch devices.',
    status: 'todo',
    priority: 'low',
    assignee: DEFAULT_ASSIGNEES[1], // Sarah Chen
    dueDate: getOffsetDate(6),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    order: 2
  },
  {
    id: 'task-6',
    title: 'E2E Test Automation for Checkout Pipeline',
    description: 'Create Playwright test specs covering the end-to-end purchasing journey including payment gateway webhooks and receipt delivery.',
    status: 'in-progress',
    priority: 'medium',
    assignee: DEFAULT_ASSIGNEES[3], // Elena Rostova
    dueDate: getOffsetDate(3),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    order: 2
  },
  {
    id: 'task-7',
    title: 'Set up CI/CD Pipeline for Automated Docker Builds',
    description: 'Configure GitHub Actions workflow to build multi-arch images, run security vulnerability scans, and push to container registry.',
    status: 'done',
    priority: 'high',
    assignee: DEFAULT_ASSIGNEES[4], // David Kim
    dueDate: getOffsetDate(-3),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    order: 0
  },
  {
    id: 'task-8',
    title: 'Accessibility Audit & WCAG 2.1 AA Compliance',
    description: 'Audit keyboard tab indexing, ARIA role announcements, color contrast ratios, and screen reader navigation landmarks.',
    status: 'done',
    priority: 'low',
    assignee: DEFAULT_ASSIGNEES[3], // Elena Rostova
    dueDate: getOffsetDate(-1),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    order: 1
  }
];
