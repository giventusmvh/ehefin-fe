import { Injectable, signal, computed } from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _config = signal<ConfirmDialogConfig | null>(null);
  private _resolve: ((value: boolean) => void) | null = null;

  readonly isOpen = computed(() => this._config() !== null);
  readonly config = computed(() => this._config());

  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    this._config.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'info',
      ...config,
    });

    return new Promise<boolean>((resolve) => {
      this._resolve = resolve;
    });
  }

  close(result: boolean) {
    if (this._resolve) {
      this._resolve(result);
      this._resolve = null;
    }
    this._config.set(null);
  }
}
