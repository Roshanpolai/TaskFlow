import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Task, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  private taskService = inject(TaskService);

  public get isOverdue(): boolean {
    return this.taskService.isTaskOverdue(this.task);
  }

  public get isDueToday(): boolean {
    if (this.task.status === 'done') return false;
    return this.task.dueDate === TaskService.getTodayString();
  }

  public get formattedDueDate(): string {
    if (!this.task.dueDate) return '';
    try {
      const parts = this.task.dueDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return this.task.dueDate;
    } catch {
      return this.task.dueDate;
    }
  }

  public onCardClick(): void {
    this.editTask.emit(this.task);
  }

  public onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.editTask.emit(this.task);
  }

  public onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteTask.emit(this.task);
  }
}
