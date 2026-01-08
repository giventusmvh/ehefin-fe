import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User, Role, Permission, CreateUserRequest } from '../models';

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
  getBranches(): Observable<ApiResponse<{ id: number; code: string; name: string }[]>> {
    return this.http.get<ApiResponse<{ id: number; code: string; name: string }[]>>(
      `${environment.apiUrl}/branches`
    );
  }
}
