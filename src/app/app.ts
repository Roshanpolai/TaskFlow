import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus, TaskPriority, Assignee } from './models/task.model';
import { TaskService } from './services/task.service';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { TaskModalComponent } from './components/task-modal/task-modal.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    DashboardStatsComponent,
    KanbanBoardComponent,
    TaskModalComponent,
    ConfirmationDialogComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public taskService = inject(TaskService);

  // Mobile sidebar drawer state
  public isSidebarOpen = false;

  // Task modal state (create / edit)
  public isTaskModalOpen = false;
  public selectedTaskForEdit: Task | null = null;
  public defaultStatusForNewTask: TaskStatus = 'todo';

  // Task delete confirmation state
  public taskToDelete: Task | null = null;

  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  public closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // Create Task
  public openCreateTaskModal(status: TaskStatus = 'todo'): void {
    this.selectedTaskForEdit = null;
    this.defaultStatusForNewTask = status;
    this.isTaskModalOpen = true;
  }

  // Edit Task
  public openEditTaskModal(task: Task): void {
    this.selectedTaskForEdit = task;
    this.defaultStatusForNewTask = task.status;
    this.isTaskModalOpen = true;
  }

  public closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.selectedTaskForEdit = null;
  }

  // Save Task (Create or Update)
  public handleSaveTask(data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: Assignee;
    dueDate: string;
  }): void {
    if (this.selectedTaskForEdit) {
      this.taskService.updateTask(this.selectedTaskForEdit.id, data);
    } else {
      this.taskService.createTask(data);
    }
  }

  // Delete Task with confirmation
  public requestDeleteTask(task: Task): void {
    this.taskToDelete = task;
  }

  public confirmDeleteTask(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
      this.taskToDelete = null;
    }
  }

  public cancelDeleteTask(): void {
    this.taskToDelete = null;
  }

  // Mobile filters change handler
  public onMobilePriorityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'all' | TaskPriority;
    this.taskService.setFilter({ priority: val });
  }

  public onMobileAssigneeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.taskService.setFilter({ assigneeId: val });
  }
}
