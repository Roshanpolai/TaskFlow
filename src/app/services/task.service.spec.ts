import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { ToastService } from './toast.service';
import { DEFAULT_ASSIGNEES, Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TaskService, ToastService]
    });
    service = TestBed.inject(TaskService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and initialize with demo tasks when localStorage is empty', () => {
    expect(service).toBeTruthy();
    const tasks = service.tasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(service.stats().total).toBe(tasks.length);
  });

  it('should create a new task and persist it to localStorage', () => {
    const initialCount = service.tasks().length;
    const newTask = service.createTask({
      title: 'New Unit Test Task',
      description: 'Testing task creation',
      status: 'todo',
      priority: 'high',
      assignee: DEFAULT_ASSIGNEES[0],
      dueDate: TaskService.getTodayString()
    });

    expect(newTask.id).toBeTruthy();
    expect(service.tasks().length).toBe(initialCount + 1);

    const stored = JSON.parse(localStorage.getItem('taskflow_tasks_v2') || '[]');
    expect(stored.some((t: Task) => t.id === newTask.id)).toBe(true);
  });

  it('should update an existing task', () => {
    const task = service.tasks()[0];
    service.updateTask(task.id, { title: 'Updated Title', priority: 'low' });

    const updated = service.tasks().find((t) => t.id === task.id);
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.priority).toBe('low');
  });

  it('should delete a task', () => {
    const task = service.tasks()[0];
    const initialCount = service.tasks().length;

    service.deleteTask(task.id);
    expect(service.tasks().length).toBe(initialCount - 1);
    expect(service.tasks().some((t) => t.id === task.id)).toBe(false);
  });

  it('should correctly move task across columns and recalculate orders', () => {
    const todoTask = service.todoTasks()[0];
    expect(todoTask).toBeTruthy();

    // Move to 'in-progress' at index 0
    service.handleDrop(todoTask.id, 'in-progress', 0);

    const moved = service.tasks().find((t) => t.id === todoTask.id);
    expect(moved?.status).toBe('in-progress');
    expect(moved?.order).toBe(0);
  });

  it('should gracefully recover from corrupted localStorage JSON', () => {
    localStorage.setItem('taskflow_tasks_v2', '{ corrupt json invalid: true');
    service.loadFromLocalStorage();

    const tasks = service.tasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should gracefully handle empty or malformed array in localStorage', () => {
    localStorage.setItem('taskflow_tasks_v2', '[]');
    service.loadFromLocalStorage();

    const tasks = service.tasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should filter tasks by priority and assignee', () => {
    service.setFilter({ priority: 'high' });
    expect(service.filteredTasks().every((t) => t.priority === 'high')).toBe(true);

    const assigneeId = DEFAULT_ASSIGNEES[1].id;
    service.setFilter({ assigneeId });
    expect(
      service.filteredTasks().every(
        (t) => t.priority === 'high' && t.assignee.id === assigneeId
      )
    ).toBe(true);

    service.clearFilters();
    expect(service.filteredTasks().length).toBe(service.tasks().length);
  });
});
