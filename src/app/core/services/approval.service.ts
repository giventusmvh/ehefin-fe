import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoanApplication, LoanHistory, ApprovalRequest, ApprovalHistoryItem } from '../models';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private http = inject(HttpClient);

  getPendingLoans(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/approval/pending`);
  }

  getMyApprovalHistory(): Observable<ApiResponse<ApprovalHistoryItem[]>> {
    return this.http.get<ApiResponse<ApprovalHistoryItem[]>>(`${environment.apiUrl}/approval/my-history`);
  }

  getLoanById(id: number): Observable<ApiResponse<LoanApplication>> {
    return this.http.get<ApiResponse<LoanApplication>>(`${environment.apiUrl}/loans/${id}`);
  }

  getLoanHistory(id: number): Observable<ApiResponse<LoanHistory[]>> {
    return this.http.get<ApiResponse<LoanHistory[]>>(`${environment.apiUrl}/loans/${id}/history`);
  }

  approve(id: number, request?: ApprovalRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(
      `${environment.apiUrl}/approval/${id}/approve`,
      request ?? {}
    );
  }

  reject(id: number, request: ApprovalRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(
      `${environment.apiUrl}/approval/${id}/reject`,
      request
    );
  }
}
