import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserFacade } from './user.facade';

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-form.html',
})
export default class UserFormComponent implements OnInit {
  private facade = inject(UserFacade);
  private router = inject(Router);

  // Expose facade signals
  roles = this.facade.roles;
  branches = this.facade.branches;
  error = this.facade.error;

  loading = signal(false);

  form = {
    name: '',
    email: '',
    password: '',
    roleId: null as number | null,
    branchId: null as number | null,
  };

  ngOnInit() {
    this.facade.loadSupportingData();
  }

  needsBranch(): boolean {
    if (!this.form.roleId) return false;
    const role = this.roles().find((r) => r.id === this.form.roleId);
    return role?.name === 'MARKETING' || role?.name === 'BRANCH_MANAGER';
  }

  async onSubmit() {
    if (!this.form.roleId) {
      this.facade.error.set('Role is required');
      return;
    }

    if (this.needsBranch() && !this.form.branchId) {
      this.facade.error.set('Branch is required for this role');
      return;
    }

    this.loading.set(true);
    this.facade.clearError();

    const result = await this.facade.createUser({
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      roleId: this.form.roleId,
      branchId: this.form.branchId ?? undefined,
    });

    if (result) {
      this.router.navigate(['/admin/users']);
    } else {
      this.loading.set(false);
    }
  }
}
