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
  templateUrl: './branch-list.html',
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
