import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User, Role, Permission, CreateUserRequest, UserBranch } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  // Users
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${environment.apiUrl}/admin/users`);
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/admin/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${environment.apiUrl}/admin/users`, request);
  }

  updateUser(
    id: number,
    data: { name?: string; email?: string; branchId?: number }
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${environment.apiUrl}/admin/users/${id}`, data);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${environment.apiUrl}/admin/users/${id}/status`, {
      isActive,
    });
  }

  assignRole(userId: number, roleId: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${environment.apiUrl}/admin/users/${userId}/roles`, {
      roleId,
    });
  }

  removeRole(userId: number, roleId: number): Observable<ApiResponse<User>> {
    return this.http.delete<ApiResponse<User>>(
      `${environment.apiUrl}/admin/users/${userId}/roles/${roleId}`
    );
  }

  // Roles
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${environment.apiUrl}/admin/roles`);
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${environment.apiUrl}/admin/roles/${roleId}/permissions`, {
      permissionIds,
    });
  }

  // Permissions
  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${environment.apiUrl}/admin/permissions`);
  }

  // Branches
  getBranches(): Observable<ApiResponse<UserBranch[]>> {
    return this.http.get<ApiResponse<UserBranch[]>>(
      `${environment.apiUrl}/branches`
    );
  }

  createBranch(data: { code: string; location: string }): Observable<ApiResponse<UserBranch>> {
    return this.http.post<ApiResponse<UserBranch>>(`${environment.apiUrl}/admin/branches`, data);
  }

  updateBranch(id: number, data: { code: string; location: string }): Observable<ApiResponse<UserBranch>> {
    return this.http.put<ApiResponse<UserBranch>>(`${environment.apiUrl}/admin/branches/${id}`, data);
  }

  deleteBranch(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/admin/branches/${id}`);
  }

  // Loans
  getLoans(): Observable<ApiResponse<import('../models').LoanApplication[]>> {
    return this.http.get<ApiResponse<import('../models').LoanApplication[]>>(`${environment.apiUrl}/loans/all`);
  }

  getLoan(id: number): Observable<ApiResponse<import('../models').LoanApplication>> {
    return this.http.get<ApiResponse<import('../models').LoanApplication>>(`${environment.apiUrl}/loans/${id}`);
  }

  getLoanHistory(id: number): Observable<ApiResponse<import('../models').LoanHistory[]>> {
    return this.http.get<ApiResponse<import('../models').LoanHistory[]>>(`${environment.apiUrl}/loans/${id}/history`);
  }

  // Note: Backend controller provided does not show update status endpoint, commenting out for now
  /*
  updateLoanStatus(
    id: number, 
    status: import('../models').LoanStatus, 
    note?: string
  ): Observable<ApiResponse<import('../models').LoanApplication>> {
    return this.http.patch<ApiResponse<import('../models').LoanApplication>>(
      `${environment.apiUrl}/loans/${id}/status`, 
      { status, note }
    );
  }
  */

  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}
