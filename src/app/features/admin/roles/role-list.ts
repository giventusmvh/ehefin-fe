import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleFacade } from './role.facade';
import { Role } from '../../../core/models';

@Component({
  selector: 'app-role-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './role-list.html',
})
export default class RoleListComponent implements OnInit {
  private facade = inject(RoleFacade);

  // Expose facade signals
  roles = this.facade.roles;
  allPermissions = this.facade.permissions;
  loading = this.facade.loading;
  saving = this.facade.saving;

  // UI-specific state
  showModal = signal(false);
  editingRole = signal<Role | null>(null);
  selectedPermissionIds = signal<Set<number>>(new Set());

  ngOnInit() {
    this.facade.loadRoles();
  }

  openEditModal(role: Role) {
    this.editingRole.set(role);
    this.selectedPermissionIds.set(new Set(role.permissions.map((p) => p.id)));
    this.facade.loadPermissions();
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

  async savePermissions() {
    const role = this.editingRole();
    if (!role) return;

    const permissionIds = Array.from(this.selectedPermissionIds());
    const result = await this.facade.updateRolePermissions(role.id, permissionIds);
    
    if (result) {
      this.closeModal();
    }
  }
}
