import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchFacade } from './branch.facade';
import { UserBranch } from '../../../core/models';

@Component({
  selector: 'app-branch-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './branch-list.html',
})
export default class BranchListComponent implements OnInit {
  private facade = inject(BranchFacade);

  // Expose facade signals
  branches = this.facade.branches;
  loading = this.facade.loading;
  saving = this.facade.saving;
  error = this.facade.error;

  // UI-specific state
  showModal = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);

  form = {
    code: '',
    location: '',
  };

  ngOnInit() {
    this.facade.loadBranches();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form = { code: '', location: '' };
    this.facade.clearError();
    this.showModal.set(true);
  }

  openEditModal(branch: UserBranch) {
    this.isEditing.set(true);
    this.editingId.set(branch.id);
    this.form = { code: branch.code, location: branch.location };
    this.facade.clearError();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async saveBranch() {
    if (!this.form.code || !this.form.location) return;

    let result: UserBranch | null;

    if (this.isEditing()) {
      result = await this.facade.updateBranch(this.editingId()!, this.form);
    } else {
      result = await this.facade.createBranch(this.form);
    }

    if (result) {
      this.closeModal();
    }
  }

  async confirmDelete(branch: UserBranch) {
    await this.facade.deleteBranch(branch);
  }
}
