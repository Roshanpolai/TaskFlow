import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Task, TaskStatus, TaskPriority, Assignee } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css'
})
export class TaskModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() task: Task | null = null;
  @Input() defaultStatus: TaskStatus = 'todo';

  @Output() saveTask = new EventEmitter<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: Assignee;
    dueDate: string;
  }>();

  @Output() deleteTask = new EventEmitter<Task>();
  @Output() closeModal = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  public taskService = inject(TaskService);

  public taskForm: FormGroup;
  public isSubmitted = false;

  // Unsaved changes confirmation
  public showDiscardConfirm = false;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(1000)]],
      status: ['todo', [Validators.required]],
      priority: ['medium', [Validators.required]],
      assigneeId: ['', [Validators.required]],
      dueDate: [TaskService.getTodayString(), [Validators.required]]
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.isSubmitted = false;
      this.populateForm();
    }
  }

  private populateForm(): void {
    const assignees = this.taskService.assignees();
    const defaultAssigneeId = assignees.length > 0 ? assignees[0].id : '';

    if (this.task) {
      this.taskForm.reset({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        assigneeId: this.task.assignee.id,
        dueDate: this.task.dueDate || TaskService.getTodayString()
      });
    } else {
      this.taskForm.reset({
        title: '',
        description: '',
        status: this.defaultStatus,
        priority: 'medium',
        assigneeId: defaultAssigneeId,
        dueDate: TaskService.getTodayString()
      });
    }
    this.taskForm.markAsPristine();
    this.taskForm.markAsUntouched();
  }

  public get isEditMode(): boolean {
    return !!this.task;
  }

  public get modalTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Create New Task';
  }

  public get selectedAssignee(): Assignee | undefined {
    const id = this.taskForm.get('assigneeId')?.value;
    return this.taskService.assignees().find((a) => a.id === id);
  }

  @HostListener('document:keydown.escape', ['$event'])
  public handleEscape(event: Event): void {
    if (this.isOpen && !this.showDiscardConfirm) {
      event.preventDefault();
      this.attemptClose();
    }
  }

  public attemptClose(): void {
    if (this.taskForm.dirty) {
      this.showDiscardConfirm = true;
    } else {
      this.closeModal.emit();
    }
  }

  public confirmDiscard(): void {
    this.showDiscardConfirm = false;
    this.closeModal.emit();
  }

  public cancelDiscard(): void {
    this.showDiscardConfirm = false;
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.attemptClose();
    }
  }

  public onSubmit(): void {
    this.isSubmitted = true;

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const val = this.taskForm.value;
    const assignee = this.taskService.getAssigneeById(val.assigneeId);

    this.saveTask.emit({
      title: val.title,
      description: val.description,
      status: val.status,
      priority: val.priority,
      assignee,
      dueDate: val.dueDate
    });

    this.closeModal.emit();
  }

  public onDelete(): void {
    if (this.task) {
      this.deleteTask.emit(this.task);
      this.closeModal.emit();
    }
  }
}
