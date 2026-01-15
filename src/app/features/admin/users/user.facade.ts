import { Injectable, inject, signal, computed } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { User, Role, UserBranch, CreateUserRequest } from '../../../core/models';

/**
 * UserFacade - Facade Pattern Implementation
 * 
 * Menyediakan interface sederhana untuk operasi user management.
 * Mengelola state (users, roles, branches) dan menyembunyikan kompleksitas
 * interaksi dengan multiple services.
 */
@Injectable({ providedIn: 'root' })
export class UserFacade {
  private adminService = inject(AdminService);
  private confirmDialog = inject(ConfirmDialogService);

  // ============ State Signals ============
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly branches = signal<UserBranch[]>([]);
  
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly togglingStatusId = signal<number | null>(null);

  // ============ Computed Signals ============
  readonly hasUsers = computed(() => this.users().length > 0);
  readonly hasRoles = computed(() => this.roles().length > 0);
  readonly hasBranches = computed(() => this.branches().length > 0);

  // ============ Data Loading ============

  /**
   * Load all users from API
   */
  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  /**
   * Load roles (cached - only fetches once)
   */
  loadRoles(): void {
    if (this.roles().length > 0) return;

    this.adminService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data ?? []);
      },
    });
  }

  /**
   * Load branches (cached - only fetches once)
   */
  loadBranches(): void {
    if (this.branches().length > 0) return;

    this.adminService.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res.data ?? []);
      },
    });
  }

  /**
   * Load supporting data (roles & branches) for edit modal
   */
  loadSupportingData(): void {
    this.loadRoles();
    this.loadBranches();
  }

  // ============ User CRUD Operations ============

  /**
   * Update user details
   */
  updateUser(
    userId: number,
    data: { name?: string; email?: string; branchId?: number }
  ): Promise<User | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.adminService.updateUser(userId, data).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateUserInList(res.data);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update user');
          this.saving.set(false);
          resolve(null);
        },
      });
    });
  }

  /**
   * Create new user
   */
  createUser(request: CreateUserRequest): Promise<User | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.adminService.createUser(request).subscribe({
        next: (res) => {
          if (res.data) {
            this.users.update((list) => [...list, res.data!]);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create user');
          this.saving.set(false);
          resolve(null);
        },
      });
    });
  }

  /**
   * Toggle user active status with confirmation dialog
   */
  async toggleUserStatus(user: User): Promise<boolean> {
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

    if (!confirmed) return false;

    return new Promise((resolve) => {
      this.togglingStatusId.set(user.id);

      this.adminService.updateUserStatus(user.id, newStatus).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateUserInList(res.data);
          }
          this.togglingStatusId.set(null);
          resolve(true);
        },
        error: () => {
          this.togglingStatusId.set(null);
          resolve(false);
        },
      });
    });
  }

  // ============ Role Management ============

  /**
   * Get roles available to assign (user doesn't have yet)
   */
  getAvailableRoles(user: User): Role[] {
    const currentRoleNames = new Set(user.roles);
    return this.roles().filter((role) => !currentRoleNames.has(role.name));
  }

  /**
   * Assign role to user
   */
  assignRole(userId: number, roleId: number): Promise<User | null> {
    return new Promise((resolve) => {
      this.error.set(null);

      this.adminService.assignRole(userId, roleId).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateUserInList(res.data);
          }
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to assign role');
          resolve(null);
        },
      });
    });
  }

  /**
   * Remove role from user with confirmation
   */
  async removeRole(user: User, roleName: string): Promise<User | null> {
    const role = this.roles().find((r) => r.name === roleName);
    if (!role) {
      this.error.set(`Role ${roleName} not found in system.`);
      return null;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Role',
      message: `Are you sure you want to remove role "${roleName}" from ${user.name}?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'warning',
    });

    if (!confirmed) return null;

    return new Promise((resolve) => {
      this.adminService.removeRole(user.id, role.id).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateUserInList(res.data);
          }
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to remove role');
          resolve(null);
        },
      });
    });
  }

  // ============ Helpers ============

  /**
   * Update a user in the local list
   */
  private updateUserInList(updatedUser: User): void {
    const updatedUsers = this.users().map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    this.users.set(updatedUsers);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get user by ID from local state
   */
  getUserById(id: number): User | undefined {
    return this.users().find((u) => u.id === id);
  }
}
