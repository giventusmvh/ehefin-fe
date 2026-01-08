import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApprovalService } from '../../core/services/approval.service';
import { LoanApplication, LoanHistory, User } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';


import { UserDetailViewComponent } from '../../shared/components/user-detail-view/user-detail-view';

@Component({
  selector: 'app-workplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, UserDetailViewComponent],
  templateUrl: './workplace.html',
})
export default class WorkplaceComponent implements OnInit {
  private authService = inject(AuthService);
  private approvalService = inject(ApprovalService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  private platformId = inject(PLATFORM_ID);

  loans = signal<LoanApplication[]>([]);
  selectedLoan = signal<LoanApplication | null>(null);
  history = signal<LoanHistory[]>([]);
  loading = signal(false);
  actionLoading = signal(false);
  note = '';

  // Modal
  showDetailModal = signal(false);
  detailUser = signal<User | null>(null);
  detailLoading = signal(false);

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

  selectLoan(loan: LoanApplication) {
    this.selectedLoan.set(loan);
    this.note = '';
    
    // Load full loan details (to get customerId)
    this.approvalService.getLoanById(loan.id)
      .pipe(
        catchError(err => {
          console.warn('Failed to load full details (likely permission issue):', err);
          return of({ data: null });
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.data) {
            console.log('Full Loan Details:', res.data);
            this.selectedLoan.set(res.data);
          }
        }
      });

    this.loadHistory(loan.id);
  }

  private loadHistory(id: number) {
    this.approvalService.getLoanHistory(id)
      .pipe(
        catchError(err => {
          console.warn('Failed to load history:', err);
          return of({ data: [] });
        })
      )
      .subscribe({
        next: (res) => {
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

  openDetailModal(customerId: number) {
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.adminService.getUser(customerId).subscribe({
      next: (res) => {
        this.detailUser.set(res.data ?? null);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailUser.set(null);
  }
}
