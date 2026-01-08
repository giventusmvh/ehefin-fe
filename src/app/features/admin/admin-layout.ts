import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <span class="text-xl font-semibold text-gray-900">Ehefin</span>
            <span class="text-sm text-gray-400">Admin</span>
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/workplace" class="text-sm text-gray-500 hover:text-gray-700">
              Workplace
            </a>
            <span class="text-sm text-gray-600">{{ userName() }}</span>
            <button (click)="logout()" class="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex gap-8">
          <!-- Sidebar -->
          <nav class="w-48 space-y-1">
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-gray-100 text-gray-900"
              class="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Users
            </a>
            <a
              routerLink="/admin/roles"
              routerLinkActive="bg-gray-100 text-gray-900"
              class="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Roles & Permissions
            </a>
          </nav>

          <!-- Content -->
          <div class="flex-1">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = computed(() => this.authService.user()?.name ?? '');

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
