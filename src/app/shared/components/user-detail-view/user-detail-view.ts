import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../../core/models';
import { SecureImagePipe } from '../../pipes/secure-image.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-detail-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SecureImagePipe],
  templateUrl: './user-detail-view.html',
})
export class UserDetailViewComponent {
  user = input.required<User>();
  
  private sanitizer = inject(DomSanitizer);
  private apiUrl = environment.apiUrl; 
  private baseUrl = this.apiUrl.replace('/api', '');

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
