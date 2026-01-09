import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, AsyncPipe, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApprovalService } from '../../core/services/approval.service';
import { LoanApplication, LoanHistory, ApprovalHistoryItem } from '../../core/models';
import { SecureImagePipe } from '../../shared/pipes/secure-image.pipe';

@Component({
  selector: 'app-workplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AsyncPipe, DatePipe, SecureImagePipe],
  templateUrl: './workplace.html',
})
export default class WorkplaceComponent implements OnInit {
  private authService = inject(AuthService);
  private approvalService = inject(ApprovalService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  private platformId = inject(PLATFORM_ID);

  // Tab state: 'pending' or 'history'
  activeTab = signal<'pending' | 'history'>('pending');

  // Pending loans
  loans = signal<LoanApplication[]>([]);
  selectedLoan = signal<LoanApplication | null>(null);
  history = signal<LoanHistory[]>([]);
  loading = signal(false);
  actionLoading = signal(false);
  note = '';

  // Approval history
  approvalHistory = signal<ApprovalHistoryItem[]>([]);
  historyLoading = signal(false);
  selectedHistoryItem = signal<ApprovalHistoryItem | null>(null);

  userName = computed(() => this.authService.user()?.name ?? '');
  roleName = computed(() => {
    const roles = this.authService.roles();
    if (roles.includes('SUPERADMIN')) return 'Super Admin';
    if (roles.includes('BACKOFFICE')) return 'Backoffice';
    if (roles.includes('BRANCH_MANAGER')) return 'Branch Manager';
    if (roles.includes('MARKETING')) return 'Marketing';
    return roles[0] ?? '';
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPendingLoans();
    }
  }

  switchTab(tab: 'pending' | 'history') {
    this.activeTab.set(tab);
    this.selectedLoan.set(null);
    this.selectedHistoryItem.set(null);
    this.history.set([]);
    if (tab === 'pending') {
      this.loadPendingLoans();
    } else {
      this.loadApprovalHistory();
    }
  }

  selectHistoryItem(item: ApprovalHistoryItem) {
    this.selectedHistoryItem.set(item);
  }

  loadPendingLoans() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading.set(true);
    this.approvalService.getPendingLoans().subscribe({
      next: (res) => {
        this.loans.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadApprovalHistory() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.historyLoading.set(true);
    this.approvalService.getMyApprovalHistory().subscribe({
      next: (res) => {
        this.approvalHistory.set(res.data ?? []);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyLoading.set(false);
      },
    });
  }

  selectLoan(loan: LoanApplication) {
    this.selectedLoan.set(loan);
    this.note = '';
    
    // Load full loan details (to get document paths)
    this.approvalService.getLoanById(loan.id)
      .pipe(
        catchError(err => {
          console.warn('Failed to load full details:', err);
          return of({ data: null });
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.selectedLoan.set(res.data);
          }
        }
      });

    this.loadHistory(loan.id);
  }

  private loadHistory(id: number) {
    console.log('Loading history for loan:', id);
    this.approvalService.getLoanHistory(id)
      .pipe(
        catchError(err => {
          console.warn('Failed to load history:', err);
          return of({ data: [] });
        })
      )
      .subscribe({
        next: (res) => {
          console.log('History loaded:', res?.data);
          this.history.set(res?.data ?? []);
        },
      });
  }

  approve() {
    const loan = this.selectedLoan();
    if (!loan) return;

    this.actionLoading.set(true);
    this.approvalService.approve(loan.id, { note: this.note || undefined }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.selectedLoan.set(null);
        this.history.set([]);
        this.loadPendingLoans();
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  reject() {
    const loan = this.selectedLoan();
    if (!loan || !this.note) return;

    this.actionLoading.set(true);
    this.approvalService.reject(loan.id, { note: this.note }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.selectedLoan.set(null);
        this.history.set([]);
        this.loadPendingLoans();
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Image helper methods
  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // If path already starts with /uploads, use as-is
    if (path.startsWith('/uploads')) return path;
    // If path starts with /, prepend /uploads
    if (path.startsWith('/')) return `/uploads${path}`;
    // Otherwise, assume it's just a filename and prepend /uploads/
    const url = `/uploads/${path}`;
    //console.log('Document path:', path, '-> URL:', url);
    return url;
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openImage(url: string) {
    if (url) window.open(url, '_blank');
  }
}

