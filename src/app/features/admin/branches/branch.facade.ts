import { Injectable, inject, signal, computed } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { UserBranch } from '../../../core/models';

/**
 * BranchFacade - Facade Pattern Implementation
 * 
 * Menyediakan interface sederhana untuk branch management (CRUD).
 */
@Injectable({ providedIn: 'root' })
export class BranchFacade {
  private adminService = inject(AdminService);
  private confirmDialog = inject(ConfirmDialogService);

  // ============ State Signals ============
  readonly branches = signal<UserBranch[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Search state
  readonly searchQuery = signal<string>('');

  // ============ Computed Signals ============
  readonly filteredBranches = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.branches();
    
    return this.branches().filter(branch => 
      branch.code.toLowerCase().includes(query) ||
      branch.location.toLowerCase().includes(query)
    );
  });

  // ============ Data Loading ============

  loadBranches(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load branches');
        this.loading.set(false);
      },
    });
  }

  // ============ CRUD Operations ============

  createBranch(data: { code: string; location: string }): Promise<UserBranch | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.adminService.createBranch(data).subscribe({
        next: (res) => {
          if (res.data) {
            this.branches.update((list) => [...list, res.data!]);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(this.formatError(err));
          resolve(null);
        },
      });
    });
  }

  updateBranch(id: number, data: { code: string; location: string }): Promise<UserBranch | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.adminService.updateBranch(id, data).subscribe({
        next: (res) => {
          if (res.data) {
            this.branches.update((list) =>
              list.map((b) => (b.id === res.data!.id ? res.data! : b))
            );
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(this.formatError(err));
          resolve(null);
        },
      });
    });
  }

  async deleteBranch(branch: UserBranch): Promise<boolean> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Branch',
      message: `Are you sure you want to delete branch "${branch.location}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return false;

    return new Promise((resolve) => {
      this.adminService.deleteBranch(branch.id).subscribe({
        next: () => {
          this.branches.update((list) => list.filter((b) => b.id !== branch.id));
          resolve(true);
        },
        error: (err) => {
          this.confirmDialog.confirm({
            title: 'Delete Failed',
            message: err.error?.message || 'Could not delete branch',
            confirmText: 'OK',
            type: 'warning',
          });
          resolve(false);
        },
      });
    });
  }

  // ============ Helpers ============

  private formatError(err: any): string {
    let msg = err.error?.message || 'Failed to save branch';
    if (err.error?.errors && Array.isArray(err.error.errors)) {
      const details = err.error.errors
        .map((e: any) => e.defaultMessage || e.message)
        .join(', ');
      if (details) msg += `: ${details}`;
    }
    return msg;
  }

  clearError(): void {
    this.error.set(null);
  }
}
