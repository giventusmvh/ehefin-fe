import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorModalService {
  private readonly _message = signal<string | null>(null);

  readonly isOpen = computed(() => this._message() !== null);
  readonly message = computed(() => this._message());

  show(message: string) {
    this._message.set(message);
  }

  close() {
    this._message.set(null);
  }
}
