import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrl: './dashboard-stats.component.css'
})
export class DashboardStatsComponent {
  public taskService = inject(TaskService);

  public filterByStatus(status: 'all' | TaskStatus): void {
    const current = this.taskService.filter().status;
    if (current === status) {
      this.taskService.setFilter({ status: 'all' });
    } else {
      this.taskService.setFilter({ status });
    }
  }
}
