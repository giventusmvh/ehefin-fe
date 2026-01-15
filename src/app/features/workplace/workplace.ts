import { Component, ChangeDetectionStrategy, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, AsyncPipe, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { WorkplaceFacade } from './workplace.facade';
import { LoanApplication, ApprovalHistoryItem } from '../../core/models';
import { SecureImagePipe } from '../../shared/pipes';
import { formatCurrency, getImageUrl, openImageInNewTab } from '../../shared/utils';

@Component({
  selector: 'app-workplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AsyncPipe, DatePipe, SecureImagePipe],
  templateUrl: './workplace.html',
})
export default class WorkplaceComponent implements OnInit {
  private authService = inject(AuthService);
  private facade = inject(WorkplaceFacade);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Tab state
  activeTab = signal<'pending' | 'history'>('pending');

  // Expose facade signals
  loans = this.facade.loans;
  selectedLoan = this.facade.selectedLoan;
  history = this.facade.loanHistory;
  loading = this.facade.loading;
  actionLoading = this.facade.actionLoading;
  approvalHistory = this.facade.approvalHistory;
  historyLoading = this.facade.historyLoading;
  userName = this.facade.userName;
  roleName = this.facade.roleName;

  // UI-specific state
  note = '';
  selectedHistoryItem = signal<ApprovalHistoryItem | null>(null);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.facade.loadPendingLoans();
    }
  }

  switchTab(tab: 'pending' | 'history') {
    this.activeTab.set(tab);
    this.facade.clearSelection();
    this.selectedHistoryItem.set(null);
    if (tab === 'pending') {
      this.facade.loadPendingLoans();
    } else {
      this.facade.loadApprovalHistory();
    }
  }

  selectHistoryItem(item: ApprovalHistoryItem) {
    this.selectedHistoryItem.set(item);
  }

  selectLoan(loan: LoanApplication) {
    this.note = '';
    this.facade.selectLoan(loan);
  }

  loadPendingLoans() {
    this.facade.loadPendingLoans();
  }

  loadApprovalHistory() {
    this.facade.loadApprovalHistory();
  }

  async approve() {
    await this.facade.approve(this.note || undefined);
    this.note = '';
  }

  async reject() {
    if (!this.note) return;
    await this.facade.reject(this.note);
    this.note = '';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  // Utility methods
  formatCurrency = formatCurrency;
  getImageUrl = getImageUrl;
  openImage = openImageInNewTab;

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
