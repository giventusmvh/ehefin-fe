import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Branch } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-form.html',
})
export default class UserFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  roles = signal<Role[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    name: '',
    email: '',
    password: '',
    roleId: null as number | null,
    branchId: null as number | null,
  };

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.adminService.getRoles().subscribe({
      next: (res) => this.roles.set(res.data ?? []),
    });
    this.adminService.getBranches().subscribe({
      next: (res) => this.branches.set(res.data ?? []),
    });
  }

  needsBranch(): boolean {
    if (!this.form.roleId) return false;
    const role = this.roles().find((r) => r.id === this.form.roleId);
    return role?.name === 'MARKETING' || role?.name === 'BRANCH_MANAGER';
  }

  onSubmit() {
    if (!this.form.roleId) {
      this.error.set('Role is required');
      return;
    }

    if (this.needsBranch() && !this.form.branchId) {
      this.error.set('Branch is required for this role');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.adminService
      .createUser({
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        roleId: this.form.roleId,
        branchId: this.form.branchId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create user');
        },
      });
  }
}
