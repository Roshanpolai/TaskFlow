import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public taskService = inject(TaskService);
  public themeService = inject(ThemeService);

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openCreateModal = new EventEmitter<void>();

  public onSearchChange(term: string): void {
    this.taskService.setFilter({ search: term });
  }

  public clearSearch(): void {
    this.taskService.setFilter({ search: '' });
  }

  public onPriorityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'all' | TaskPriority;
    this.taskService.setFilter({ priority: val });
  }

  public onAssigneeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.taskService.setFilter({ assigneeId: val });
  }

  public onClearAllFilters(): void {
    this.taskService.clearFilters();
  }

  public onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public onAddTask(): void {
    this.openCreateModal.emit();
  }

  public onHamburgerClick(): void {
    this.toggleSidebar.emit();
  }
}
