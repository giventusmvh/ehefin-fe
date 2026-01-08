import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
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
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900 font-medium hover:text-blue-600">
                    <a [routerLink]="['/admin/users', user.id]" class="hover:underline">
                      {{ user.name }}
                    </a>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <div class="flex flex-wrap gap-1">
                      @for (roleName of user.roles; track roleName) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {{ roleName }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.branch?.location ?? '-' }}</td>
                  <td class="px-6 py-4">
                    <button
                      (click)="confirmToggleStatus(user)"
                      [disabled]="togglingStatus() === user.id"
                      class="text-xs px-2 py-1 rounded cursor-pointer transition-colors"
                      [class.bg-green-50]="user.isActive"
                      [class.text-green-600]="user.isActive"
                      [class.hover:bg-green-100]="user.isActive"
                      [class.bg-gray-100]="!user.isActive"
                      [class.text-gray-500]="!user.isActive"
                      [class.hover:bg-gray-200]="!user.isActive"
                    >
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      (click)="openEditModal(user)"
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-gray-400">No users found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Edit User Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 class="text-lg font-semibold text-gray-900">Edit User</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-6">
              @if (error()) {
                <div class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {{ error() }}
                </div>
              }

              <!-- Basic Info -->
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    [(ngModel)]="editForm.name"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="editForm.email"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    [(ngModel)]="editForm.branchId"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option [ngValue]="null">No branch</option>
                    @for (branch of branches(); track branch.id) {
                      <option [ngValue]="branch.id">{{ branch.location }} ({{ branch.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Roles Management -->
              <div class="border-t border-gray-100 pt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Roles</h4>
                
                <!-- Current Roles -->
                <div class="flex flex-wrap gap-2 mb-4">
                  @for (roleName of editingUser()?.roles; track roleName) {
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {{ roleName }}
                      <button (click)="removeRole(roleName)" class="text-blue-400 hover:text-blue-600 focus:outline-none">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </span>
                  }
                  @if (editingUser()?.roles?.length === 0) {
                    <span class="text-sm text-gray-400 italic">No roles assigned</span>
                  }
                </div>

                <!-- Add Role -->
                <div class="flex gap-2">
                  <select
                    [(ngModel)]="selectedRoleId"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option [ngValue]="null">Select role to add...</option>
                    @for (role of availableRolesToAdd(); track role.id) {
                      <option [ngValue]="role.id">{{ role.name }}</option>
                    }
                  </select>
                  <button
                    (click)="assignSelectedRole()"
                    [disabled]="!selectedRoleId"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                (click)="closeModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                (click)="saveUser()"
                [disabled]="saving()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Save Details
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class UserListComponent implements OnInit {
  private adminService = inject(AdminService);
  private confirmDialog = inject(ConfirmDialogService);

  users = signal<User[]>([]);
  allRoles = signal<Role[]>([]);
  branches = signal<{ id: number; code: string; location: string }[]>([]);
  loading = signal(false);

  // Modal state
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  // Status toggle
  togglingStatus = signal<number | null>(null);

  // Edit User Form
  editForm = {
    name: '',
    email: '',
    branchId: null as number | null,
  };
  
  // Role Management
  selectedRoleId: number | null = null;
  
  // Computed: available roles that user doesn't have yet
  availableRolesToAdd = computed(() => {
    const user = this.editingUser();
    if (!user) return [];
    const currentRoleNames = new Set(user.roles);
    return this.allRoles().filter(role => !currentRoleNames.has(role.name));
  });

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

  private loadRoles() {
    if (this.allRoles().length === 0) {
      this.adminService.getRoles().subscribe({
        next: (res) => {
          this.allRoles.set(res.data ?? []);
        }
      });
    }
  }

  private loadBranches() {
    if (this.branches().length === 0) {
      this.adminService.getBranches().subscribe({
        next: (res) => {
          this.branches.set(res.data ?? []);
        },
      });
    }
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.editForm = {
      name: user.name,
      email: user.email,
      branchId: user.branch?.id ?? null,
    };
    this.selectedRoleId = null;
    this.error.set(null);
    this.loadBranches();
    this.loadRoles();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.error.set(null);
  }

  saveUser() {
    const user = this.editingUser();
    if (!user) return;

    this.saving.set(true);
    this.error.set(null);

    const data: { name?: string; email?: string; branchId?: number } = {};
    if (this.editForm.name !== user.name) data.name = this.editForm.name;
    if (this.editForm.email !== user.email) data.email = this.editForm.email;
    if (this.editForm.branchId !== (user.branch?.id ?? null)) {
      data.branchId = this.editForm.branchId ?? undefined;
    }

    this.adminService.updateUser(user.id, data).subscribe({
      next: (res) => {
        if (res.data) {
          const updatedUsers = this.users().map((u) =>
            u.id === user.id ? res.data! : u
          );
          this.users.set(updatedUsers);
          this.editingUser.set(res.data); // Update modal as well
        }
        this.saving.set(false);
        // We don't close modal here, letting user continue editing if they want (or click Close)
        // Or common UX is to close on save. Let's keep it open since we have Role mgmt too?
        // Actually for "Save Details", closing is standard.
        this.closeModal();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Failed to update user');
      },
    });
  }

  async confirmToggleStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';

    const confirmed = await this.confirmDialog.confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} User`,
      message: `Are you sure you want to ${action} "${user.name}"? ${
        !newStatus ? 'This user will not be able to login.' : ''
      }`,
      confirmText: newStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: newStatus ? 'info' : 'warning',
    });

    if (confirmed) {
      this.toggleStatus(user);
    }
  }

  private toggleStatus(user: User) {
    this.togglingStatus.set(user.id);

    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe({
      next: (res) => {
        if (res.data) {
          const updatedUsers = this.users().map((u) =>
            u.id === user.id ? res.data! : u
          );
          this.users.set(updatedUsers);
        }
        this.togglingStatus.set(null);
      },
      error: () => {
        this.togglingStatus.set(null);
      },
    });
  }

  // Role Management Methods
  
  async removeRole(roleName: string) {
    const user = this.editingUser();
    if (!user) return;

    const role = this.allRoles().find(r => r.name === roleName);
    if (!role) {
      this.error.set(`Role ${roleName} not found in system.`);
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Role',
      message: `Are you sure you want to remove role "${roleName}" from ${user.name}?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
      this.adminService.removeRole(user.id, role.id).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateLocalUser(res.data);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to remove role');
        }
      });
    }
  }

  assignSelectedRole() {
    const user = this.editingUser();
    const roleId = this.selectedRoleId;
    
    if (!user || !roleId) return;

    this.adminService.assignRole(user.id, roleId).subscribe({
      next: (res) => {
        if (res.data) {
          this.updateLocalUser(res.data);
          this.selectedRoleId = null;
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to assign role');
      }
    });
  }

  private updateLocalUser(updatedUser: User) {
    // Update list
    const updatedUsers = this.users().map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    this.users.set(updatedUsers);
    
    // Update currently editing user to reflect changes immediately
    this.editingUser.set(updatedUser);
  }
}
