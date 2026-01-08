import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Permission } from '../../../core/models';

@Component({
  selector: 'app-role-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div>
      <h1 class="text-xl font-semibold text-gray-900 mb-6">Roles & Permissions</h1>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          Loading...
        </div>
      } @else {
        <div class="space-y-4">
          @for (role of roles(); track role.id) {
            <div class="bg-white rounded-xl border border-gray-100 p-6">
              <h2 class="font-medium text-gray-900 mb-4">{{ role.name }}</h2>
              <div class="flex flex-wrap gap-2">
                @for (perm of role.permissions; track perm) {
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {{ perm }}
                  </span>
                } @empty {
                  <span class="text-xs text-gray-400">No permissions</span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export default class RoleListComponent implements OnInit {
  private adminService = inject(AdminService);

  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.adminService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
