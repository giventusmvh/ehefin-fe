import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../../core/models';
import { SecureImagePipe } from '../../pipes/secure-image.pipe';
import { getImageUrl, openImageInNewTab } from '../../utils';

@Component({
  selector: 'app-user-detail-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SecureImagePipe],
  templateUrl: './user-detail-view.html',
})
export class UserDetailViewComponent {
  user = input.required<User>();

  private sanitizer = inject(DomSanitizer);

  getImageUrl = getImageUrl;
  openImage = openImageInNewTab;

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

