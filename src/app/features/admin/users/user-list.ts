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
  templateUrl: './user-list.html',
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
