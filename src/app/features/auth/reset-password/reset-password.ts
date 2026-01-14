import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export default class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error.set('Token tidak valid. Silakan request link reset password baru.');
      }
    });
  }

  onSubmit() {
    this.error.set(null);

    if (!this.token) {
      this.error.set('Token tidak valid');
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.error.set('Semua field harus diisi');
      return;
    }

    if (this.newPassword.length < 6) {
      this.error.set('Password minimal 6 karakter');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Password dan konfirmasi password tidak sama');
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.success.set(true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.error.set(response.message || 'Gagal reset password');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Token tidak valid atau sudah expired');
      },
    });
  }
}
