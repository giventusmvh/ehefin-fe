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
  template: `
    <div class="max-w-4xl mx-auto pb-12">
      <!-- ... Header ... -->
      <div class="mb-6 flex items-center gap-4">
        <a routerLink="/admin/users" class="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </a>
        <h1 class="text-xl font-semibold text-gray-900">User Details</h1>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          Loading...
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600">
          {{ error() }}
        </div>
      } @else if (user()) {
        <div class="space-y-6">
          <!-- Main Info Card -->
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div class="h-24 bg-gradient-to-r from-gray-900 to-gray-800"></div>
            
            <div class="px-8 pb-8">
              <div class="relative -mt-12 mb-6 flex items-end justify-between">
                <div class="flex items-end gap-6">
                  <div class="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                    <div class="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-500 uppercase">
                      {{ user()!.name.charAt(0) }}
                    </div>
                  </div>
                  <div class="mb-2">
                    <h2 class="text-2xl font-bold text-gray-900">{{ user()!.name }}</h2>
                    <p class="text-gray-500">{{ user()!.email }}</p>
                  </div>
                </div>
                <!-- Status badges -->
                <div class="mb-2 flex gap-3">
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium border"
                    [class.bg-green-50]="user()!.isActive"
                    [class.text-green-700]="user()!.isActive"
                    [class.border-green-100]="user()!.isActive"
                    [class.bg-red-50]="!user()!.isActive"
                    [class.text-red-700]="!user()!.isActive"
                    [class.border-red-100]="!user()!.isActive"
                  >
                    {{ user()!.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {{ user()!.userType }}
                  </span>
                </div>
              </div>

              <!-- Info Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Account Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-400">User ID</label>
                      <div class="text-sm font-medium text-gray-900">#{{ user()!.id }}</div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-400">Created At</label>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user()!.createdAt ? (user()!.createdAt | date:'medium') : '-' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Organization</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-400">Branch</label>
                      @if (user()!.branch) {
                        <div class="text-sm font-medium text-gray-900">
                          {{ user()!.branch?.location }} ({{ user()!.branch?.code }})
                        </div>
                      } @else {
                        <div class="text-sm text-gray-400 italic">No branch assigned</div>
                      }
                    </div>
                    <div>
                      <label class="block text-xs text-gray-400">Roles</label>
                      <div class="mt-1 flex flex-wrap gap-2">
                        @for (role of user()!.roles; track role) {
                          <span class="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {{ role }}
                          </span>
                        }
                        @if (user()!.roles.length === 0) {
                          <span class="text-sm text-gray-400 italic">No roles</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Information -->
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
            </div>
            <div class="p-6">
              @if (user()!.profile) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Profile Details -->
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-400">NIK</label>
                      <div class="text-sm font-medium text-gray-900">{{ user()!.profile?.nik || '-' }}</div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-400">Phone</label>
                      <div class="text-sm font-medium text-gray-900">{{ user()!.profile?.phone || '-' }}</div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-400">Birthdate</label>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user()!.profile?.birthdate ? (user()!.profile?.birthdate | date:'longDate') : '-' }}
                      </div>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-400">Address</label>
                      <div class="text-sm font-medium text-gray-900">{{ user()!.profile?.address || '-' }}</div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-400">Profile Status</label>
                      <span 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        [class.bg-green-100]="user()!.profile?.isComplete"
                        [class.text-green-800]="user()!.profile?.isComplete"
                        [class.bg-yellow-100]="!user()!.profile?.isComplete"
                        [class.text-yellow-800]="!user()!.profile?.isComplete"
                      >
                        {{ user()!.profile?.isComplete ? 'Complete' : 'Incomplete' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Documents -->
                <div class="mt-8 border-t border-gray-100 pt-6">
                  <h4 class="text-sm font-medium text-gray-900 mb-4">Documents</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <!-- KTP -->
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                      <span class="text-xs font-medium text-gray-500 mb-2">KTP</span>
                      @if (user()!.profile?.ktpUrl) {
                        @if (getImageUrl(user()!.profile?.ktpUrl) | secureImage | async; as src) {
                          <img 
                            [src]="sanitize($any(src))" 
                            alt="KTP" 
                            class="w-full h-32 object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                            (click)="openImage($any(src))"
                          />
                        }
                      } @else {
                        <div class="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs italic">
                          No Image
                        </div>
                      }
                    </div>

                    <!-- KK -->
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                      <span class="text-xs font-medium text-gray-500 mb-2">KK</span>
                      @if (user()!.profile?.kkUrl) {
                        @if (getImageUrl(user()!.profile?.kkUrl) | secureImage | async; as src) {
                          <img 
                            [src]="sanitize($any(src))" 
                            alt="KK" 
                            class="w-full h-32 object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                            (click)="openImage($any(src))"
                          />
                        }
                      } @else {
                        <div class="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs italic">
                          No Image
                        </div>
                      }
                    </div>

                    <!-- NPWP -->
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                      <span class="text-xs font-medium text-gray-500 mb-2">NPWP</span>
                      @if (user()!.profile?.npwpUrl) {
                        @if (getImageUrl(user()!.profile?.npwpUrl) | secureImage | async; as src) {
                          <img 
                            [src]="sanitize($any(src))" 
                            alt="NPWP" 
                            class="w-full h-32 object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                            (click)="openImage($any(src))"
                          />
                        }
                      } @else {
                        <div class="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs italic">
                          No Image
                        </div>
                      }
                    </div>
                  </div>
                </div>

              } @else {
                <div class="text-center py-8">
                  <div class="text-gray-400 italic">Tidak ada data profile</div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
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
