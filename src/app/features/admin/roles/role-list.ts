import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Permission } from '../../../core/models';

@Component({
  selector: 'app-role-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
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
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-medium text-gray-900">{{ role.name }}</h2>
                <button
                  (click)="openEditModal(role)"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit Permissions
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (perm of role.permissions; track perm.id) {
                  <span class="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                    {{ perm.code }}
                  </span>
                } @empty {
                  <span class="text-xs text-gray-400">No permissions</span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Edit Permissions Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                Edit Permissions: {{ editingRole()?.name }}
              </h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-6 overflow-y-auto max-h-[60vh]">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (perm of allPermissions(); track perm.id) {
                  <label
                    class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                    [class.border-blue-500]="isPermissionSelected(perm.id)"
                    [class.bg-blue-50]="isPermissionSelected(perm.id)"
                    [class.border-gray-200]="!isPermissionSelected(perm.id)"
                    [class.hover:bg-gray-50]="!isPermissionSelected(perm.id)"
                  >
                    <input
                      type="checkbox"
                      [checked]="isPermissionSelected(perm.id)"
                      (change)="togglePermission(perm.id)"
                      class="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ perm.code }}</div>
                      <div class="text-xs text-gray-500">{{ perm.description }}</div>
                    </div>
                  </label>
                }
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                (click)="closeModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                (click)="savePermissions()"
                [disabled]="saving()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Save Changes
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class RoleListComponent implements OnInit {
  private adminService = inject(AdminService);

  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  loading = signal(false);

  // Modal state
  showModal = signal(false);
  editingRole = signal<Role | null>(null);
  selectedPermissionIds = signal<Set<number>>(new Set());
  saving = signal(false);

  ngOnInit() {
    this.loadRoles();
  }

  private loadRoles() {
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

  private loadPermissions() {
    // Load permissions only when needed (modal opened)
    if (this.allPermissions().length === 0) {
      this.adminService.getPermissions().subscribe({
        next: (res) => {
          this.allPermissions.set(res.data ?? []);
        },
      });
    }
  }

  openEditModal(role: Role) {
    this.editingRole.set(role);
    this.selectedPermissionIds.set(new Set(role.permissions.map((p) => p.id)));
    this.loadPermissions(); // Load permissions lazily
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingRole.set(null);
    this.selectedPermissionIds.set(new Set());
  }

  isPermissionSelected(permId: number): boolean {
    return this.selectedPermissionIds().has(permId);
  }

  togglePermission(permId: number) {
    const current = this.selectedPermissionIds();
    const newSet = new Set(current);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    this.selectedPermissionIds.set(newSet);
  }

  savePermissions() {
    const role = this.editingRole();
    if (!role) return;

    this.saving.set(true);
    const permissionIds = Array.from(this.selectedPermissionIds());

    this.adminService.updateRolePermissions(role.id, permissionIds).subscribe({
      next: (res) => {
        // Update the role in the list
        if (res.data) {
          const updatedRoles = this.roles().map((r) =>
            r.id === role.id ? res.data! : r
          );
          this.roles.set(updatedRoles);
        }
        this.saving.set(false);
        this.closeModal();
      },
      error: () => {
        this.saving.set(false);
        alert('Failed to update permissions');
      },
    });
  }
}
