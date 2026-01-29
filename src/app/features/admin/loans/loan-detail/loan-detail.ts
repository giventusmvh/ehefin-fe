import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, TitleCasePipe, AsyncPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { LoanFacade } from '../loan.facade';
import { LoanStatus } from '../../../../core/models';
import { SecureImagePipe } from '../../../../shared/pipes';
import { getImageUrl, openImageInNewTab } from '../../../../shared/utils';

@Component({
  selector: 'app-loan-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, TitleCasePipe, SecureImagePipe, AsyncPipe],
  templateUrl: './loan-detail.html',
})
export default class LoanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(LoanFacade);
  sanitizer = inject(DomSanitizer);

  loan = this.facade.selectedLoan;
  history = this.facade.loanHistory;
  loading = this.facade.loading;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadLoan(Number(id));
    }
  }
  
  // Utility methods exposed to template
  getImageUrl = getImageUrl;
  openImage = openImageInNewTab;

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getStatusColor(status: LoanStatus | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'MARKETING_APPROVED':
      case 'BRANCH_MANAGER_APPROVED': return 'bg-blue-100 text-blue-800';
      case 'DISBURSED': return 'bg-green-100 text-green-800';
      case 'MARKETING_REJECTED':
      case 'BRANCH_MANAGER_REJECTED':
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatStatus(status: string | undefined): string {
      return status ? status.replace(/_/g, ' ') : '-';
  }
}
