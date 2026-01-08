import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export default class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Email dan password harus diisi');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.redirectBasedOnRole(response.data.roles);
        } else {
          this.error.set(response.message || 'Login gagal');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email atau password salah');
      },
    });
  }

  private redirectBasedOnRole(roles: string[]) {
    if (roles.includes('SUPERADMIN')) {
      this.router.navigate(['/admin']);
    } else if (
      roles.includes('MARKETING') ||
      roles.includes('BRANCH_MANAGER') ||
      roles.includes('BACKOFFICE')
    ) {
      this.router.navigate(['/workplace']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
