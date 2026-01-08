import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold text-gray-900">Users</h1>
        <a
          routerLink="/admin/users/new"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          Create User
        </a>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          Loading...
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ user.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.roles.join(', ') || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.branch?.location ?? '-' }}</td>
                  <td class="px-6 py-4">
                    @if (user.isActive) {
                      <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    } @else {
                      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Inactive</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-gray-400">No users found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export default class UserListComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<User[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
