import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserFacade } from './user.facade';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  templateUrl: './user-list.html',
})
export default class UserListComponent implements OnInit {
  // Inject facade instead of multiple services
  private facade = inject(UserFacade);

  // Expose facade signals to template
  users = this.facade.users;
  allRoles = this.facade.roles;
  branches = this.facade.branches;
  loading = this.facade.loading;
  togglingStatus = this.facade.togglingStatusId;

  // UI-specific state (kept in component)
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  saving = this.facade.saving;
  error = this.facade.error;

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
    return this.facade.getAvailableRoles(user);
  });

  ngOnInit() {
    this.facade.loadUsers();
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.editForm = {
      name: user.name,
      email: user.email,
      branchId: user.branch?.id ?? null,
    };
    this.selectedRoleId = null;
    this.facade.clearError();
    this.facade.loadSupportingData();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.facade.clearError();
  }

  async saveUser() {
    const user = this.editingUser();
    if (!user) return;

    const data: { name?: string; email?: string; branchId?: number } = {};
    if (this.editForm.name !== user.name) data.name = this.editForm.name;
    if (this.editForm.email !== user.email) data.email = this.editForm.email;
    if (this.editForm.branchId !== (user.branch?.id ?? null)) {
      data.branchId = this.editForm.branchId ?? undefined;
    }

    const updatedUser = await this.facade.updateUser(user.id, data);
    if (updatedUser) {
      this.closeModal();
    }
  }

  async confirmToggleStatus(user: User) {
    await this.facade.toggleUserStatus(user);
  }

  async removeRole(roleName: string) {
    const user = this.editingUser();
    if (!user) return;

    const updatedUser = await this.facade.removeRole(user, roleName);
    if (updatedUser) {
      this.editingUser.set(updatedUser);
    }
  }

  async assignSelectedRole() {
    const user = this.editingUser();
    const roleId = this.selectedRoleId;
    
    if (!user || !roleId) return;

    const updatedUser = await this.facade.assignRole(user.id, roleId);
    if (updatedUser) {
      this.editingUser.set(updatedUser);
      this.selectedRoleId = null;
    }
  }
}
