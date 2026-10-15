import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  public taskService = inject(TaskService);
  public showResetConfirm = false;

  public get completionPercentage(): number {
    const stats = this.taskService.stats();
    if (stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }

  public onRequestReset(): void {
    this.showResetConfirm = true;
  }

  public confirmReset(): void {
    this.showResetConfirm = false;
    this.taskService.resetDemoData();
    if (this.isOpen) {
      this.closeSidebar.emit();
    }
  }

  public cancelReset(): void {
    this.showResetConfirm = false;
  }

  public onClose(): void {
    this.closeSidebar.emit();
  }
}
