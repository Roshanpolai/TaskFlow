import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  public show(message: string, type: ToastType = 'info', title?: string, duration: number = 3500): void {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const toast: ToastMessage = { id, message, type, title, duration };

    this.toastsSignal.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  public success(message: string, title: string = 'Success'): void {
    this.show(message, 'success', title);
  }

  public error(message: string, title: string = 'Error'): void {
    this.show(message, 'danger', title);
  }

  public warning(message: string, title: string = 'Notice'): void {
    this.show(message, 'warning', title);
  }

  public info(message: string, title: string = 'Info'): void {
    this.show(message, 'info', title);
  }

  public dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}
