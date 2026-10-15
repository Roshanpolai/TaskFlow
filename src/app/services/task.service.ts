import { Injectable, computed, signal, inject } from '@angular/core';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFilter,
  TaskStats,
  Assignee,
  DEFAULT_ASSIGNEES,
  INITIAL_TASKS
} from '../models/task.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'taskflow_tasks_v2';
  private toastService = inject(ToastService);

  // Core State Signals
  private tasksSignal = signal<Task[]>([]);
  public readonly tasks = this.tasksSignal.asReadonly();

  public readonly assignees = signal<Assignee[]>(DEFAULT_ASSIGNEES);

  public readonly filter = signal<TaskFilter>({
    search: '',
    priority: 'all',
    assigneeId: 'all',
    status: 'all'
  });

  // Helper to get formatted today string (YYYY-MM-DD)
  public static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Check if a task is overdue: due date is before today and status is not done
  public isTaskOverdue(task: Task): boolean {
    if (task.status === 'done') {
      return false;
    }
    if (!task.dueDate) {
      return false;
    }
    return task.dueDate < TaskService.getTodayString();
  }

  // Computed: whether any filter is currently active
  public readonly isFilterActive = computed<boolean>(() => {
    const f = this.filter();
    return (
      f.search.trim().length > 0 ||
      f.priority !== 'all' ||
      f.assigneeId !== 'all' ||
      f.status !== 'all'
    );
  });

  // Computed: dynamic dashboard statistics derived from all tasks
  public readonly stats = computed<TaskStats>(() => {
    const all = this.tasksSignal();
    const todayStr = TaskService.getTodayString();

    let inProgress = 0;
    let done = 0;
    let overdue = 0;

    for (const t of all) {
      if (t.status === 'in-progress') inProgress++;
      if (t.status === 'done') done++;
      if (t.status !== 'done' && t.dueDate && t.dueDate < todayStr) {
        overdue++;
      }
    }

    return {
      total: all.length,
      inProgress,
      done,
      overdue
    };
  });

  // Computed: Total counts per column (unfiltered)
  public readonly totalColumnCounts = computed<{ todo: number; 'in-progress': number; done: number }>(() => {
    const all = this.tasksSignal();
    return {
      todo: all.filter((t) => t.status === 'todo').length,
      'in-progress': all.filter((t) => t.status === 'in-progress').length,
      done: all.filter((t) => t.status === 'done').length
    };
  });

  // Computed: tasks after applying active search and filters
  public readonly filteredTasks = computed<Task[]>(() => {
    const all = this.tasksSignal();
    const f = this.filter();
    const searchTerm = f.search.trim().toLowerCase();

    return all.filter((t) => {
      // 1. Status Filter
      if (f.status !== 'all' && t.status !== f.status) {
        return false;
      }

      // 2. Priority Filter
      if (f.priority !== 'all' && t.priority !== f.priority) {
        return false;
      }

      // 3. Assignee Filter
      if (f.assigneeId !== 'all' && t.assignee.id !== f.assigneeId) {
        return false;
      }

      // 4. Search Filter (matches title or description)
      if (searchTerm) {
        const matchesTitle = t.title.toLowerCase().includes(searchTerm);
        const matchesDesc = (t.description || '').toLowerCase().includes(searchTerm);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  });

  // Computed columns based on filtered tasks, sorted by order
  public readonly todoTasks = computed<Task[]>(() => {
    return this.filteredTasks()
      .filter((t) => t.status === 'todo')
      .sort((a, b) => a.order - b.order);
  });

  public readonly inProgressTasks = computed<Task[]>(() => {
    return this.filteredTasks()
      .filter((t) => t.status === 'in-progress')
      .sort((a, b) => a.order - b.order);
  });

  public readonly doneTasks = computed<Task[]>(() => {
    return this.filteredTasks()
      .filter((t) => t.status === 'done')
      .sort((a, b) => a.order - b.order);
  });

  constructor() {
    this.loadFromLocalStorage();
  }

  // Safe loading with fallback to sample tasks and error handling
  public loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.tasksSignal.set(this.generateFreshDemoTasks());
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const initial = this.generateFreshDemoTasks();
        this.tasksSignal.set(initial);
        this.saveToLocalStorage(initial);
        return;
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initial = this.generateFreshDemoTasks();
        this.tasksSignal.set(initial);
        this.saveToLocalStorage(initial);
        return;
      }

      // Validate each task structure
      const validated: Task[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          ['todo', 'in-progress', 'done'].includes(item.status) &&
          ['low', 'medium', 'high'].includes(item.priority) &&
          item.assignee &&
          typeof item.assignee.name === 'string'
        ) {
          validated.push({
            id: item.id,
            title: item.title,
            description: item.description || '',
            status: item.status,
            priority: item.priority,
            assignee: item.assignee,
            dueDate: item.dueDate || TaskService.getTodayString(),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            order: typeof item.order === 'number' ? item.order : validated.length
          });
        }
      }

      if (validated.length === 0) {
        throw new Error('No valid tasks found in stored data');
      }

      this.tasksSignal.set(validated);
    } catch (err) {
      console.warn('Failed to parse localStorage tasks. Resetting to initial demo data:', err);
      const initial = this.generateFreshDemoTasks();
      this.tasksSignal.set(initial);
      this.saveToLocalStorage(initial);
      this.toastService.warning('Corrupted data detected and recovered with demo tasks.');
    }
  }

  private saveToLocalStorage(tasksToSave?: Task[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const list = tasksToSave || this.tasksSignal();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
      this.toastService.error('Storage limit reached. Unable to save changes.');
    }
  }

  // Create fresh demo tasks with relative dates
  private generateFreshDemoTasks(): Task[] {
    const today = new Date();
    const getOffset = (days: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    return INITIAL_TASKS.map((t, index) => {
      let offset = 0;
      if (t.id === 'task-1') offset = 1;
      else if (t.id === 'task-2') offset = 2;
      else if (t.id === 'task-3') offset = 4;
      else if (t.id === 'task-4') offset = -2; // Overdue
      else if (t.id === 'task-5') offset = 6;
      else if (t.id === 'task-6') offset = 3;
      else if (t.id === 'task-7') offset = -3;
      else if (t.id === 'task-8') offset = -1;

      return {
        ...t,
        dueDate: getOffset(offset),
        order: index
      };
    });
  }

  // CRUD Operations

  public createTask(data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: Assignee;
    dueDate: string;
  }): Task {
    const currentTasks = this.tasksSignal();
    const columnTasks = currentTasks.filter((t) => t.status === data.status);
    const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order ?? 0), -1);

    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.dueDate || TaskService.getTodayString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: maxOrder + 1
    };

    const updated = [newTask, ...currentTasks];
    this.tasksSignal.set(updated);
    this.saveToLocalStorage(updated);
    this.toastService.success(`Task "${newTask.title}" created successfully.`);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): void {
    const current = this.tasksSignal();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) return;

    const existing = current[index];
    const isStatusChanged = updates.status && updates.status !== existing.status;

    let targetOrder = existing.order;
    if (isStatusChanged) {
      const targetColumnTasks = current.filter((t) => t.status === updates.status);
      targetOrder = targetColumnTasks.reduce((max, t) => Math.max(max, t.order ?? 0), -1) + 1;
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      order: isStatusChanged ? targetOrder : (updates.order ?? existing.order),
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...current];
    updatedList[index] = updatedTask;

    this.tasksSignal.set(updatedList);
    this.saveToLocalStorage(updatedList);
    this.toastService.success(`Task "${updatedTask.title}" updated.`);
  }

  public deleteTask(id: string): void {
    const current = this.tasksSignal();
    const taskToDelete = current.find((t) => t.id === id);
    const filtered = current.filter((t) => t.id !== id);

    this.tasksSignal.set(filtered);
    this.saveToLocalStorage(filtered);
    this.toastService.info(`Task "${taskToDelete?.title || 'item'}" deleted.`);
  }

  /**
   * Reorders tasks after a drag-and-drop event.
   * Handles both moving within a column and moving between columns,
   * gracefully supporting cases where filters are active.
   */
  public handleDrop(
    taskId: string,
    targetStatus: TaskStatus,
    targetIndex: number
  ): void {
    const allTasks = [...this.tasksSignal()];
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const movedTask = { ...allTasks[taskIndex] };
    const previousStatus = movedTask.status;

    // Update status and timestamp
    movedTask.status = targetStatus;
    movedTask.updatedAt = new Date().toISOString();

    // Remove moved task from array
    allTasks.splice(taskIndex, 1);

    // Get all other tasks in the target status column, sorted by their current order
    const targetColumnTasks = allTasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order - b.order);

    // Insert the moved task at the target index (bounded properly)
    const clampedIndex = Math.max(0, Math.min(targetIndex, targetColumnTasks.length));
    targetColumnTasks.splice(clampedIndex, 0, movedTask);

    // Re-index order for the target column
    targetColumnTasks.forEach((t, idx) => {
      t.order = idx;
    });

    // Also re-index order for previous column if moved across columns
    if (previousStatus !== targetStatus) {
      const sourceColumnTasks = allTasks
        .filter((t) => t.status === previousStatus)
        .sort((a, b) => a.order - b.order);
      sourceColumnTasks.forEach((t, idx) => {
        t.order = idx;
      });
    }

    // Reconstruct the full list
    const otherTasks = allTasks.filter(
      (t) => t.status !== targetStatus && t.status !== previousStatus
    );
    const updatedAll = [
      ...otherTasks,
      ...targetColumnTasks,
      ...(previousStatus !== targetStatus
        ? allTasks.filter((t) => t.status === previousStatus)
        : [])
    ];

    this.tasksSignal.set(updatedAll);
    this.saveToLocalStorage(updatedAll);
  }

  public setFilter(updates: Partial<TaskFilter>): void {
    this.filter.update((current) => ({
      ...current,
      ...updates
    }));
  }

  public clearFilters(): void {
    this.filter.set({
      search: '',
      priority: 'all',
      assigneeId: 'all',
      status: 'all'
    });
    this.toastService.info('Filters cleared.');
  }

  public resetDemoData(): void {
    const fresh = this.generateFreshDemoTasks();
    this.tasksSignal.set(fresh);
    this.clearFilters();
    this.saveToLocalStorage(fresh);
    this.toastService.success('Reset to sample demo data successfully.');
  }

  public getAssigneeById(id: string): Assignee {
    return this.assignees().find((a) => a.id === id) || DEFAULT_ASSIGNEES[0];
  }
}
