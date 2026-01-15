import { Injectable, inject, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Permission } from '../../../core/models';

/**
 * RoleFacade - Facade Pattern Implementation
 * 
 * Menyediakan interface sederhana untuk role & permission management.
 */
@Injectable({ providedIn: 'root' })
export class RoleFacade {
  private adminService = inject(AdminService);

  // ============ State Signals ============
  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // ============ Data Loading ============

  loadRoles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load roles');
        this.loading.set(false);
      },
    });
  }

  loadPermissions(): void {
    if (this.permissions().length > 0) return;

    this.adminService.getPermissions().subscribe({
      next: (res) => {
        this.permissions.set(res.data ?? []);
      },
    });
  }

  // ============ Role Operations ============

  updateRolePermissions(roleId: number, permissionIds: number[]): Promise<Role | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.adminService.updateRolePermissions(roleId, permissionIds).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateRoleInList(res.data);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update permissions');
          this.saving.set(false);
          resolve(null);
        },
      });
    });
  }

  // ============ Helpers ============

  private updateRoleInList(updatedRole: Role): void {
    const updated = this.roles().map((r) =>
      r.id === updatedRole.id ? updatedRole : r
    );
    this.roles.set(updated);
  }

  clearError(): void {
    this.error.set(null);
  }
}
