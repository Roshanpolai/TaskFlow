import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule
} from '@angular/cdk/drag-drop';
import { Task, TaskStatus, KANBAN_COLUMNS, KanbanColumn } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent {
  public taskService = inject(TaskService);
  public columns: KanbanColumn[] = KANBAN_COLUMNS;

  @Output() createTaskInColumn = new EventEmitter<TaskStatus>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  public getTasksForColumn(status: TaskStatus): Task[] {
    switch (status) {
      case 'todo':
        return this.taskService.todoTasks();
      case 'in-progress':
        return this.taskService.inProgressTasks();
      case 'done':
        return this.taskService.doneTasks();
      default:
        return [];
    }
  }

  public getConnectedTo(): string[] {
    return ['col-todo', 'col-in-progress', 'col-done'];
  }

  public onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    const task = event.item.data as Task;
    if (!task) return;

    this.taskService.handleDrop(task.id, targetStatus, event.currentIndex);
  }

  public onAddClick(status: TaskStatus): void {
    this.createTaskInColumn.emit(status);
  }

  public onEdit(task: Task): void {
    this.editTask.emit(task);
  }

  public onDelete(task: Task): void {
    this.deleteTask.emit(task);
  }
}
