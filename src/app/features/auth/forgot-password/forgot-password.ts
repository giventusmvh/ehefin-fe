import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export default class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  onSubmit() {
    if (!this.email) {
      this.error.set('Email harus diisi');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Always show success for security (don't reveal if email exists)
        this.success.set(true);
      },
    });
  }
}
