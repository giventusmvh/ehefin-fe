import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApprovalService } from '../../core/services/approval.service';
import { LoanApplication, LoanHistory, ApprovalHistoryItem, LoanStatus } from '../../core/models';

/**
 * WorkplaceFacade - Facade Pattern Implementation
 * 
 * Menyediakan interface sederhana untuk loan approval workflow.
 * Mengelola state dan menyembunyikan kompleksitas interaksi services.
 */
@Injectable({ providedIn: 'root' })
export class WorkplaceFacade {
  private authService = inject(AuthService);
  private approvalService = inject(ApprovalService);
  private platformId = inject(PLATFORM_ID);

  // ============ State Signals ============
  readonly loans = signal<LoanApplication[]>([]);
  readonly selectedLoan = signal<LoanApplication | null>(null);
  readonly loanHistory = signal<LoanHistory[]>([]);
  readonly approvalHistory = signal<ApprovalHistoryItem[]>([]);

  readonly loading = signal(false);
  readonly historyLoading = signal(false);
  readonly actionLoading = signal(false);

  // Search state
  readonly pendingSearchQuery = signal<string>('');
  readonly historySearchQuery = signal<string>('');

  // ============ Computed Signals ============
  readonly userName = computed(() => this.authService.user()?.name ?? '');
  readonly roleName = computed(() => {
    const roles = this.authService.roles();
    if (roles.includes('SUPERADMIN')) return 'Super Admin';
    if (roles.includes('BACKOFFICE')) return 'Backoffice';
    if (roles.includes('BRANCH_MANAGER')) return 'Branch Manager';
    if (roles.includes('MARKETING')) return 'Marketing';
    return roles[0] ?? '';
  });

  // Filtered pending loans based on search query
  readonly filteredLoans = computed(() => {
    const query = this.pendingSearchQuery().toLowerCase().trim();
    if (!query) return this.loans();
    
    return this.loans().filter(loan => 
      loan.customerName.toLowerCase().includes(query) ||
      (loan.customerEmail?.toLowerCase().includes(query) ?? false) ||
      loan.id.toString().includes(query) ||
      (loan.branchName?.toLowerCase().includes(query) ?? false) ||
      (loan.productName?.toLowerCase().includes(query) ?? false) ||
      loan.requestedAmount.toString().includes(query)
    );
  });

  // Filtered approval history based on search query
  readonly filteredApprovalHistory = computed(() => {
    const query = this.historySearchQuery().toLowerCase().trim();
    if (!query) return this.approvalHistory();
    
    return this.approvalHistory().filter(item => 
      item.customerName.toLowerCase().includes(query) ||
      item.productName.toLowerCase().includes(query) ||
      item.branchLocation.toLowerCase().includes(query) ||
      item.actionTaken.toLowerCase().includes(query) ||
      item.loanAmount.toString().includes(query)
    );
  });

  // ============ Data Loading ============

  loadPendingLoans(): void {
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

  loadApprovalHistory(): void {
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

  selectLoan(loan: LoanApplication): void {
    this.selectedLoan.set(loan);
    this.loanHistory.set([]);

    // Load full loan details
    this.approvalService
      .getLoanById(loan.id)
      .pipe(catchError(() => of({ data: null })))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.selectedLoan.set(res.data);
          }
        },
      });

    // Load loan history
    this.approvalService
      .getLoanHistory(loan.id)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe({
        next: (res) => {
          this.loanHistory.set(res?.data ?? []);
        },
      });
  }

  clearSelection(): void {
    this.selectedLoan.set(null);
    this.loanHistory.set([]);
  }

  // ============ Approval Actions ============

  approve(note?: string): Promise<boolean> {
    const loan = this.selectedLoan();
    if (!loan) return Promise.resolve(false);

    return new Promise((resolve) => {
      this.actionLoading.set(true);

      this.approvalService.approve(loan.id, { note }).subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.clearSelection();
          this.loadPendingLoans();
          resolve(true);
        },
        error: () => {
          this.actionLoading.set(false);
          resolve(false);
        },
      });
    });
  }

  reject(note: string): Promise<boolean> {
    const loan = this.selectedLoan();
    if (!loan || !note) return Promise.resolve(false);

    return new Promise((resolve) => {
      this.actionLoading.set(true);

      this.approvalService.reject(loan.id, { note }).subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.clearSelection();
          this.loadPendingLoans();
          resolve(true);
        },
        error: () => {
          this.actionLoading.set(false);
          resolve(false);
        },
      });
    });
  }
}
