import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogComponent, ErrorModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ehefin-fe');
}
