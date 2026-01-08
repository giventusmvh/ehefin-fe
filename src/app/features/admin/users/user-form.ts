import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Role, Branch } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-lg">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/users" class="text-gray-400 hover:text-gray-600">
          ←
        </a>
        <h1 class="text-xl font-semibold text-gray-900">Create User</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        @if (error()) {
          <div class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {{ error() }}
          </div>
        }

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            [(ngModel)]="form.name"
            name="name"
            required
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            [(ngModel)]="form.email"
            name="email"
            required
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            [(ngModel)]="form.password"
            name="password"
            required
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            [(ngModel)]="form.roleId"
            name="roleId"
            required
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option [ngValue]="null">Select role...</option>
            @for (role of roles(); track role.id) {
              @if (role.name !== 'CUSTOMER') {
                <option [ngValue]="role.id">{{ role.name }}</option>
              }
            }
          </select>
        </div>

        @if (needsBranch()) {
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              [(ngModel)]="form.branchId"
              name="branchId"
              required
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option [ngValue]="null">Select branch...</option>
              @for (branch of branches(); track branch.id) {
                <option [ngValue]="branch.id">{{ branch.name }}</option>
              }
            </select>
          </div>
        }

        <div class="pt-4">
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            @if (loading()) {
              Creating...
            } @else {
              Create User
            }
          </button>
        </div>
      </form>
    </div>
  `,
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
