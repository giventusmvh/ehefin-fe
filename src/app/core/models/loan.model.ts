export type LoanStatus =
  | 'SUBMITTED'
  | 'MARKETING_APPROVED'
  | 'MARKETING_REJECTED'
  | 'BRANCH_MANAGER_APPROVED'
  | 'BRANCH_MANAGER_REJECTED'
  | 'APPROVED'
  | 'REJECTED';

export interface LoanApplication {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerNik?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerBirthdate?: string;
  customerKtpPath?: string;
  customerKkPath?: string;
  customerNpwpPath?: string;
  // Backend may return flat fields OR nested objects
  productId?: number;
  productName?: string;
  product?: Product;
  branchId?: number;
  branchName?: string;
  branch?: Branch;
  requestedAmount: number;
  requestedTenor: number;
  requestedRate: number;
  status: LoanStatus;
  createdAt: string;
}

export interface LoanHistory {
  id: number;
  status: LoanStatus;
  note?: string;
  approvedBy: string;
  approvedByRole: string;
  approvedByBranchName?: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  amount: number;
  tenor: number;
  interestRate: number;
}

export interface Branch {
  id: number;
  code: string;
  location: string;
}

export interface ApprovalRequest {
  note?: string;
}

export interface ApprovalHistoryItem {
  id: number;
  loanId: number;
  customerName: string;
  productName: string;
  loanAmount: number;
  branchLocation: string;
  actionTaken: LoanStatus;
  note?: string;
  actionDate: string;
}
