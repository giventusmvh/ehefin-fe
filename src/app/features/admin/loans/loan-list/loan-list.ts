import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanFacade } from '../loan.facade';
import { LoanStatus } from '../../../../core/models';

@Component({
  selector: 'app-loan-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CurrencyPipe, TitleCasePipe, FormsModule],
  templateUrl: './loan-list.html',
})
export default class LoanListComponent implements OnInit {
  private facade = inject(LoanFacade);

  loans = this.facade.filteredLoans;
  loading = this.facade.loading;
  searchQuery = this.facade.searchQuery;

  ngOnInit() {
    this.facade.loadLoans();
  }

  getStatusColor(status: LoanStatus): string {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'MARKETING_APPROVED':
      case 'BRANCH_MANAGER_APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'DISBURSED':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'MARKETING_REJECTED':
      case 'BRANCH_MANAGER_REJECTED':
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
