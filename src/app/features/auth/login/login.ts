import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="text-2xl font-semibold text-gray-900">Ehefin</a>
          <p class="mt-2 text-sm text-gray-500">Staff Login</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {{ error() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="mt-6 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <span>Loading...</span>
            } @else {
              <span>Login</span>
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-400">
          <a routerLink="/" class="hover:text-gray-600">← Kembali ke beranda</a>
        </p>
      </div>
    </div>
  `,
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
