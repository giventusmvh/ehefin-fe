import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { User, UserPlafond } from '../../../core/models';
import { UserFacade } from './user.facade';
import { UserDetailViewComponent } from '../../../shared/components/user-detail-view/user-detail-view';



@Component({
  selector: 'app-user-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, UserDetailViewComponent],
  templateUrl: './user-detail.html',
})
export default class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private userFacade = inject(UserFacade);
  private confirmDialog = inject(ConfirmDialogService);
  
  user = signal<User | null>(null);
  plafond = signal<UserPlafond | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          let cachedUser = this.userFacade.getUserById(id);
          if (cachedUser) {
            this.user.set(cachedUser);
            this.loadPlafond(id);
          } else {
            this.loadUser(id);
          }
        } else {
          this.error.set('Invalid User ID');
        }
      }
    });
  }

  private loadUser(id: number) {
    this.loading.set(true);
    this.adminService.getUser(id).subscribe({
      next: (res) => {
        this.user.set(res.data ?? null);
        this.loading.set(false);
        // Load plafond if user exists
        if (res.data) {
          this.loadPlafond(id);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load user details');
      }
    });
  }

  private loadPlafond(userId: number) {
    this.adminService.getUserPlafond(userId).subscribe({
      next: (res) => {
         this.plafond.set(res.data ?? null);
      },
      error: () => {
        // Silently fail or set null if no plafond
        this.plafond.set(null);
      }
    });
  }

  async deactivatePlafond() {
    const user = this.user();
    if (!user) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Deactivate Plafond',
      message: `Are you sure you want to deactivate plafond for "${user.name}"?`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      type: 'warning',
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.adminService.deactivateUserPlafond(user.id).subscribe({
      next: () => {
        this.loadPlafond(user.id); // Reload plafond
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to deactivate plafond');
      }
    });
  }
}
