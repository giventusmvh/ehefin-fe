import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { SecureImagePipe } from '../../../shared/pipes/secure-image.pipe';

@Component({
  selector: 'app-user-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, SecureImagePipe],
  templateUrl: './user-detail.html',
})
export default class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private sanitizer = inject(DomSanitizer);
  
  private apiUrl = environment.apiUrl; 
  private baseUrl = this.apiUrl.replace('/api', '');

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

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openImage(url: string) {
    if (url) window.open(url, '_blank');
  }
}
