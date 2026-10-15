import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TaskService } from './services/task.service';
import { ThemeService } from './services/theme.service';
import { ToastService } from './services/toast.service';

describe('TaskFlow App', () => {
  let taskService: TaskService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [TaskService, ThemeService, ToastService]
    }).compileComponents();

    taskService = TestBed.inject(TaskService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the TaskFlow branding in the sidebar', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const brandElement = compiled.querySelector('.brand-name');
    expect(brandElement?.textContent?.trim()).toBe('TaskFlow');
  });

  it('should initialize with default demo tasks', () => {
    const tasks = taskService.tasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(taskService.stats().total).toBe(tasks.length);
  });

  it('should open task modal in create mode', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.openCreateTaskModal('in-progress');

    expect(app.isTaskModalOpen).toBe(true);
    expect(app.selectedTaskForEdit).toBeNull();
    expect(app.defaultStatusForNewTask).toBe('in-progress');
  });

  it('should filter tasks by search term', () => {
    taskService.setFilter({ search: 'OAuth2' });
    const filtered = taskService.filteredTasks();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toContain('OAuth2');

    taskService.clearFilters();
    expect(taskService.filteredTasks().length).toBe(taskService.tasks().length);
  });

  it('should calculate overdue tasks accurately', () => {
    const stats = taskService.stats();
    expect(typeof stats.overdue).toBe('number');
    expect(stats.overdue).toBeGreaterThanOrEqual(1); // Task 4 is seeded as overdue
  });
});
