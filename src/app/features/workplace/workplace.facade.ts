import { Injectable, inject, signal, computed, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  Subject, 
  forkJoin, 
  of, 
  timer,
  catchError, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  retry,
  tap
} from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApprovalService } from '../../core/services/approval.service';
import { LoanApplication, LoanHistory, ApprovalHistoryItem, LoanStatus } from '../../core/models';

/**
 * WorkplaceFacade - Facade Pattern Implementation with RxJS
 * 
 * Features:
 * - debounceTime: Search tidak spam API calls
 * - switchMap: Cancel pending request saat user pilih loan baru
 * - retry: Auto-retry dengan exponential backoff
 * - forkJoin: Load multiple data secara paralel
 */
@Injectable({ providedIn: 'root' })
export class WorkplaceFacade {
  private authService = inject(AuthService);
  private approvalService = inject(ApprovalService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

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

  // ============ RxJS Subjects ============
  
  /** Subject for debounced pending search */
  private pendingSearchSubject = new Subject<string>();
  
  /** Subject for debounced history search */
  private historySearchSubject = new Subject<string>();
  
  /** Subject for loan selection with auto-cancel */
  private selectLoanSubject = new Subject<LoanApplication>();

  constructor() {
    this.setupSearchDebounce();
    this.setupLoanSelection();
  }

  // ============ RxJS Setup ============

  private setupSearchDebounce(): void {
    // Debounce pending search (300ms delay)
    this.pendingSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.pendingSearchQuery.set(query);
    });

    // Debounce history search (300ms delay)
    this.historySearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.historySearchQuery.set(query);
    });
  }

  private setupLoanSelection(): void {
    // switchMap: Cancel previous request when new loan is selected
    this.selectLoanSubject.pipe(
      tap(loan => {
        this.selectedLoan.set(loan);
        this.loanHistory.set([]);
        this.loading.set(true);
      }),
      switchMap(loan => 
        forkJoin({
          loanDetail: this.approvalService.getLoanById(loan.id).pipe(
            catchError(() => of({ data: null }))
          ),
          history: this.approvalService.getLoanHistory(loan.id).pipe(
            catchError(() => of({ data: [] }))
          )
        })
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ loanDetail, history }) => {
      if (loanDetail?.data) {
        this.selectedLoan.set(loanDetail.data);
      }
      this.loanHistory.set(history?.data ?? []);
      this.loading.set(false);
    });
  }

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

  // ============ Public Methods ============

  /** 
   * Update pending search query with debounce (300ms)
   * Prevents API spam when user types quickly
   */
  updatePendingSearch(query: string): void {
    this.pendingSearchSubject.next(query);
  }

  /** 
   * Update history search query with debounce (300ms)
   */
  updateHistorySearch(query: string): void {
    this.historySearchSubject.next(query);
  }

  // ============ Data Loading ============

  loadPendingLoans(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading.set(true);
    this.approvalService.getPendingLoans().pipe(
      // Retry 3x with exponential backoff (1s, 2s, 3s)
      retry({
        count: 3,
        delay: (error, retryCount) => timer(retryCount * 1000)
      }),
      catchError(() => of({ data: [] }))
    ).subscribe({
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
    this.approvalService.getMyApprovalHistory().pipe(
      // Retry 3x with exponential backoff
      retry({
        count: 3,
        delay: (error, retryCount) => timer(retryCount * 1000)
      }),
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (res) => {
        this.approvalHistory.set(res.data ?? []);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyLoading.set(false);
      },
    });
  }

  /**
   * Select loan with auto-cancel previous request (switchMap)
   * Also loads loan details and history in parallel (forkJoin)
   */
  selectLoan(loan: LoanApplication): void {
    this.selectLoanSubject.next(loan);
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

      this.approvalService.approve(loan.id, { note }).pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => timer(retryCount * 1000)
        })
      ).subscribe({
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

      this.approvalService.reject(loan.id, { note }).pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => timer(retryCount * 1000)
        })
      ).subscribe({
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
