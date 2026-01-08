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
  productId: number;
  productName: string;
  branchId: number;
  branchName: string;
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
