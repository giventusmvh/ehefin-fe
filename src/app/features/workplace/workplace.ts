import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApprovalService } from '../../core/services/approval.service';
import { LoanApplication, LoanHistory } from '../../core/models';

@Component({
  selector: 'app-workplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './workplace.html',
})
export default class WorkplaceComponent implements OnInit {
  private authService = inject(AuthService);
  private approvalService = inject(ApprovalService);
  private router = inject(Router);

  loans = signal<LoanApplication[]>([]);
  selectedLoan = signal<LoanApplication | null>(null);
  history = signal<LoanHistory[]>([]);
  loading = signal(false);
  actionLoading = signal(false);
  note = '';

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
    this.loadPendingLoans();
  }

  loadPendingLoans() {
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
    this.loadHistory(loan.id);
  }

  private loadHistory(id: number) {
    this.approvalService.getLoanHistory(id).subscribe({
      next: (res) => {
        this.history.set(res.data ?? []);
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
}
