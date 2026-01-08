import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models';
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
  
  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          this.loadUser(id);
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
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load user details');
      }
    });
  }
}
