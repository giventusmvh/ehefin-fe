import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Permission } from '../../../core/models';

@Component({
  selector: 'app-role-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './role-list.html',
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
