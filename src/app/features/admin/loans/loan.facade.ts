import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
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
import { AdminService } from '../../../core/services/admin.service';
import { LoanApplication, LoanStatus, LoanHistory } from '../../../core/models';

/**
 * LoanFacade - Facade Pattern Implementation with RxJS
 *
 * Features:
 * - debounceTime: Search tidak spam filter
 * - switchMap: Cancel pending request saat loan baru dipilih
 * - forkJoin: Load loan details + history secara paralel
 * - retry: Auto-retry dengan exponential backoff
 */
@Injectable({ providedIn: 'root' })
export class LoanFacade {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  // ============ State Signals ============
  readonly loans = signal<LoanApplication[]>([]);
  readonly selectedLoan = signal<LoanApplication | null>(null);
  readonly loanHistory = signal<LoanHistory[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Search state
  readonly searchQuery = signal<string>('');

  // ============ RxJS Subjects ============
  
  /** Subject for debounced search */
  private searchSubject = new Subject<string>();
  
  /** Subject for loan selection with auto-cancel */
  private selectLoanSubject = new Subject<number>();

  constructor() {
    this.setupSearchDebounce();
    this.setupLoanSelection();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
  }

  private setupLoanSelection(): void {
    // switchMap: Cancel previous request when new loan is selected
    this.selectLoanSubject.pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
        this.selectedLoan.set(null);
      }),
      switchMap(loanId => 
        forkJoin({
          loan: this.adminService.getLoan(loanId).pipe(
            retry({ count: 2, delay: 1000 }),
            catchError(() => of({ data: null }))
          ),
          history: this.adminService.getLoanHistory(loanId).pipe(
            retry({ count: 2, delay: 1000 }),
            catchError(() => of({ data: [] }))
          )
        })
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ loan, history }) => {
      if (loan?.data) {
        this.selectedLoan.set(loan.data);
      }
      this.loanHistory.set(history?.data ?? []);
      this.loading.set(false);
    });
  }

  // ============ Computed Signals ============
  readonly filteredLoans = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.loans();
    
    return this.loans().filter(loan => 
      loan.customerName.toLowerCase().includes(query) ||
      (loan.customerEmail?.toLowerCase().includes(query) ?? false) ||
      loan.id.toString().includes(query) ||
      loan.status.toLowerCase().includes(query) ||
      (loan.branchName?.toLowerCase().includes(query) ?? false) ||
      (loan.productName?.toLowerCase().includes(query) ?? false)
    );
  });

  // ============ Public Methods ============

  /**
   * Update search query with debounce (300ms)
   */
  updateSearch(query: string): void {
    this.searchSubject.next(query);
  }

  // ============ Data Loading ============

  loadLoans(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getLoans().pipe(
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
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load loans');
        this.loading.set(false);
      },
    });
  }

  /**
   * Select loan with auto-cancel previous request (switchMap)
   * Also loads loan details and history in parallel (forkJoin)
   */
  loadLoan(id: number): void {
    this.selectLoanSubject.next(id);
  }

  loadHistory(id: number): void {
    this.adminService.getLoanHistory(id).pipe(
      retry({ count: 2, delay: 1000 })
    ).subscribe({
      next: (res) => {
        this.loanHistory.set(res.data ?? []);
      },
      error: () => {
        this.loanHistory.set([]);
      }
    });
  }

  downloadDocument(url: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      this.adminService.downloadFile(url).pipe(
        retry({ count: 2, delay: 1000 })
      ).subscribe({
        next: (blob: Blob) => resolve(blob),
        error: (err: unknown) => reject(err)
      });
    });
  }

  // ============ Helpers ============

  clearError(): void {
    this.error.set(null);
  }
}
