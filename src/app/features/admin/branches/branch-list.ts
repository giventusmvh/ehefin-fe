import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { UserBranch } from '../../../core/models';

@Component({
  selector: 'app-branch-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold text-gray-900">Branches</h1>
        <button
          (click)="openCreateModal()"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          Create Branch
        </button>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          Loading...
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (branch of branches(); track branch.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ branch.code }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ branch.location }}</td>
                  <td class="px-6 py-4 flex items-center gap-3">
                    <button
                      (click)="openEditModal(branch)"
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      (click)="confirmDelete(branch)"
                      class="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="px-6 py-8 text-center text-gray-400">No branches found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create/Edit Branch Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing() ? 'Edit Branch' : 'Create Branch' }}
              </h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-4">
              @if (error()) {
                <div class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {{ error() }}
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  [(ngModel)]="form.code"
                  placeholder="e.g. JKT"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  [(ngModel)]="form.location"
                  placeholder="e.g. Jakarta"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
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
                (click)="saveBranch()"
                [disabled]="saving() || !form.code || !form.location"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Save
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class BranchListComponent implements OnInit {
  private adminService = inject(AdminService);
  private confirmDialog = inject(ConfirmDialogService);

  branches = signal<UserBranch[]>([]);
  loading = signal(false);

  // Modal State
  showModal = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = {
    code: '',
    location: '',
  };

  ngOnInit() {
    this.loadBranches();
  }

  private loadBranches() {
    this.loading.set(true);
    this.adminService.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form = { code: '', location: '' };
    this.error.set(null);
    this.showModal.set(true);
  }

  openEditModal(branch: UserBranch) {
    this.isEditing.set(true);
    this.editingId.set(branch.id);
    this.form = { code: branch.code, location: branch.location };
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveBranch() {
    if (!this.form.code || !this.form.location) return;

    this.saving.set(true);
    this.error.set(null);

    const request = this.isEditing()
      ? this.adminService.updateBranch(this.editingId()!, this.form)
      : this.adminService.createBranch(this.form);

    request.subscribe({
      next: (res) => {
        if (res.data) {
          if (this.isEditing()) {
            this.branches.update((list) =>
              list.map((b) => (b.id === res.data!.id ? res.data! : b))
            );
          } else {
            this.branches.update((list) => [...list, res.data!]);
          }
          this.closeModal();
        }
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        let msg = err.error?.message || 'Failed to save branch';
        // Handle Spring Boot standard validation errors
        if (err.error?.errors && Array.isArray(err.error.errors)) {
           const details = err.error.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
           if (details) msg += `: ${details}`;
        }
        this.error.set(msg);
      },
    });
  }

  async confirmDelete(branch: UserBranch) {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Branch',
      message: `Are you sure you want to delete branch "${branch.location}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (confirmed) {
      this.adminService.deleteBranch(branch.id).subscribe({
        next: () => {
          this.branches.update((list) => list.filter((b) => b.id !== branch.id));
        },
        error: (err) => {
          // Show error alert (maybe reuse confirm dialog with simple info type?)
          // For now, simpler to reuse confirmDialog as an alert
          this.confirmDialog.confirm({
            title: 'Delete Failed',
            message: err.error?.message || 'Could not delete branch',
            confirmText: 'OK',
            type: 'warning',
            // Hacky way to make it an alert: hide cancel or ignore result
          });
        },
      });
    }
  }
}
