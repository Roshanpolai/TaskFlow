import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'taskflow_theme_v1';
  private darkModeSignal = signal<boolean>(false);

  public readonly isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    let isDark = false;

    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.darkModeSignal.set(isDark);
    this.applyTheme(isDark);
  }

  public toggleTheme(): void {
    const nextDark = !this.darkModeSignal();
    this.darkModeSignal.set(nextDark);
    this.applyTheme(nextDark);
    localStorage.setItem(this.THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
  }

  public setTheme(theme: AppTheme): void {
    const isDark = theme === 'dark';
    this.darkModeSignal.set(isDark);
    this.applyTheme(isDark);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
      }
    }
  }
}
